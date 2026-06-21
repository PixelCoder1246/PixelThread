const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');

const generateSecureToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  image: user.image,
  isEmailVerified: user.isEmailVerified,
  });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

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

    console.log("Verification token:", rawToken);
    return sendSuccess(res, 201, 'Registration successful. Please verify your email.', {
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    return sendSuccess(res, 200, 'Login successful.', {
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const hashedRefreshToken = hashToken(refreshToken);
      // Delete the specific session
      await prisma.session.deleteMany({ where: { token: hashedRefreshToken } });
    }

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Current user fetched.', { user: req.user });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new ApiError(400, 'Refresh token is required.');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token. Please log in again.');
    }

    const hashedToken = hashToken(token);
    const session = await prisma.session.findUnique({ where: { token: hashedToken } });
    if (!session || session.expiresAt < new Date()) {
      throw new ApiError(401, 'Session not found or expired. Please log in again.');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw new ApiError(401, 'User no longer exists.');
    }

    const newAccessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    // Revoke old session and create new session for rotation
    await prisma.$transaction([
      prisma.session.delete({ where: { id: session.id } }),
      prisma.session.create({
        data: {
          userId: user.id,
          token: hashToken(newRefreshToken),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }),
    ]);

    res.cookie('accessToken', newAccessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

    return sendSuccess(res, 200, 'Token refreshed.');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, 'Email is required.');

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return sendSuccess(
        res,
        200,
        'If an account with that email exists, a password reset link has been sent.'
      );
    }

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = generateSecureToken();
    const hashedToken = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: hashedToken, expiresAt },
    });

    sendPasswordResetEmail(user.email, rawToken).catch((err) =>
      console.error('Failed to send password reset email:', err)
    );

    return sendSuccess(
      res,
      200,
      'If an account with that email exists, a password reset link has been sent.'
    );
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

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
      throw new ApiError(400, 'Invalid or expired reset token. Please request a new one.');
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

    return sendSuccess(res, 200, 'Password reset successfully. Please log in with your new password.');
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new ApiError(400, 'Verification token is required.');

    const hashedToken = hashToken(token);

    const record = await prisma.emailVerificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new ApiError(400, 'Invalid or expired verification token. Please request a new one.');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { isEmailVerified: true },
      }),
      prisma.emailVerificationToken.delete({ where: { id: record.id } }),
    ]);

    return sendSuccess(res, 200, 'Email verified successfully. You can now log in.');
  } catch (err) {
    next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, 'Email is required.');

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return sendSuccess(
        res,
        200,
        'If your account exists and is unverified, a new verification email has been sent.'
      );
    }

    if (user.isEmailVerified) {
      throw new ApiError(400, 'This email is already verified.');
    }

    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

    const rawToken = generateSecureToken();
    const hashedToken = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token: hashedToken, expiresAt },
    });

    sendVerificationEmail(user.email, rawToken).catch((err) =>
      console.error('Failed to resend verification email:', err)
    );

    return sendSuccess(
      res,
      200,
      'If your account exists and is unverified, a new verification email has been sent.'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
