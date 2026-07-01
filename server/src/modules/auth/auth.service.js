const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../utils/jwt');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../../services/email.service');

const generateSecureToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  image: user.image,
  isEmailVerified: user.isEmailVerified,
});

const registerUser = async ({ name, email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId: user.id, token: hashedToken, expiresAt },
  });

  sendVerificationEmail(user.email, rawToken).catch((err) =>
    console.error('Failed to send verification email:', err)
  );

  return { user, rawVerificationToken: rawToken };
};

const loginUser = async ({ email, password, ip, userAgent }) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in.');
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ id: user.id });
  const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.session.create({
    data: {
      userId: user.id,
      token: hashedRefreshToken,
      expiresAt: sessionExpiresAt,
      ipAddress: ip,
      userAgent,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { user, accessToken, refreshToken };
};

const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    const hashedRefreshToken = hashToken(refreshToken);
    await prisma.session.deleteMany({ where: { token: hashedRefreshToken } });
  }
};

const refreshUserSession = async (refreshToken, ip, userAgent) => {
  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token is required.');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(
      401,
      'Invalid or expired refresh token. Please log in again.'
    );
  }

  const hashedToken = hashToken(refreshToken);
  const session = await prisma.session.findUnique({
    where: { token: hashedToken },
  });
  if (!session || session.expiresAt < new Date()) {
    throw new ApiError(
      401,
      'Session not found or expired. Please log in again.'
    );
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    throw new ApiError(401, 'User no longer exists.');
  }

  const newAccessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  await prisma.$transaction([
    prisma.session.delete({ where: { id: session.id } }),
    prisma.session.create({
      data: {
        userId: user.id,
        token: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: ip,
        userAgent,
      },
    }),
  ]);

  return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const forgotPassword = async (email) => {
  if (!email) throw new ApiError(400, 'Email is required.');

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { rawToken: null };
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token: hashedToken, expiresAt },
  });

  sendPasswordResetEmail(user.email, rawToken).catch((err) =>
    console.error('Failed to send password reset email:', err)
  );

  return { rawToken };
};

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new ApiError(400, 'Token and new password are required.');
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters.');
  }

  const hashedToken = hashToken(token);

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

  if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
    throw new ApiError(
      400,
      'Invalid or expired reset token. Please request a new one.'
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { used: true },
    }),
    prisma.session.deleteMany({ where: { userId: resetRecord.userId } }),
  ]);
};

const verifyEmail = async (token) => {
  if (!token) throw new ApiError(400, 'Verification token is required.');

  const hashedToken = hashToken(token);

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new ApiError(
      400,
      'Invalid or expired verification token. Please request a new one.'
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { isEmailVerified: true },
    }),
    prisma.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);
};

const resendVerification = async (email) => {
  if (!email) throw new ApiError(400, 'Email is required.');

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { rawToken: null };
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'This email is already verified.');
  }

  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id },
  });

  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId: user.id, token: hashedToken, expiresAt },
  });

  sendVerificationEmail(user.email, rawToken).catch((err) =>
    console.error('Failed to resend verification email:', err)
  );

  return { user, rawToken };
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  sanitizeUser,
};
