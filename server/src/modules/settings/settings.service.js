const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { sendEmailChangeVerification } = require('../../services/email.service');
const notificationService = require('../notifications/notification.service');
const {
  DEFAULT_NOTIFICATION_PREFERENCES,
  IMAGE_MAX_SIZE,
} = require('./settings.constants');
const {
  userSettingsSelect,
  deleteFile,
  hashPassword,
  generateSecureToken,
  hashToken,
} = require('./settings.utils');

const getMySettings = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSettingsSelect,
  });

  if (!user) throw new ApiError(404, 'User not found.');

  return user;
};

const updateProfile = async (userId, updates) => {
  if (updates.username) {
    const existing = await prisma.user.findUnique({
      where: { username: updates.username },
      select: { id: true },
    });
    if (existing && existing.id !== userId) {
      throw new ApiError(409, 'Username is already taken.');
    }
  }

  if (updates.website) {
    if (updates.website.length > 500) {
      throw new ApiError(400, 'Website URL must not exceed 500 characters.');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: userSettingsSelect,
  });

  return user;
};

const changeEmail = async (userId, { newEmail, password }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, password: true },
  });

  if (!user) throw new ApiError(404, 'User not found.');

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  if (newEmail === user.email) {
    throw new ApiError(400, 'New email is the same as your current email.');
  }

  const existing = await prisma.user.findUnique({
    where: { email: newEmail },
    select: { id: true },
  });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  await prisma.emailVerificationToken.deleteMany({
    where: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { pendingEmail: newEmail },
  });

  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId, token: hashedToken, expiresAt },
  });

  await notificationService
    .createSystemNotification({
      recipientId: userId,
      title: 'Email Change Initiated',
      message:
        'A request to change your email was made. Please verify your new email address.',
      referenceType: 'SYSTEM',
    })
    .catch(() => {});

  sendEmailChangeVerification(newEmail, rawToken).catch((err) =>
    console.error('Failed to send email change verification:', err)
  );

  return {
    message:
      'Verification email sent to your new email address. Your email will be updated once verified.',
    pendingEmail: newEmail,
  };
};

const verifyNewEmail = async (token) => {
  if (!token) throw new ApiError(400, 'Verification token is required.');

  const hashedToken = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token: hashedToken },
    include: {
      user: { select: { id: true, pendingEmail: true, email: true } },
    },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new ApiError(
      400,
      'Invalid or expired verification token. Please request a new one.'
    );
  }

  const user = record.user;
  if (!user.pendingEmail) {
    throw new ApiError(400, 'No pending email change found.');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        pendingEmail: null,
        isEmailVerified: true,
      },
    }),
    prisma.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);

  await notificationService
    .createSystemNotification({
      recipientId: user.id,
      title: 'Email Changed',
      message: 'Your email address has been updated successfully.',
      referenceType: 'SYSTEM',
    })
    .catch(() => {});
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) throw new ApiError(404, 'User not found.');

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(
      400,
      'New password must be different from your current password.'
    );
  }

  const hashedNewPassword = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    }),
    prisma.session.deleteMany({ where: { userId } }),
  ]);

  await notificationService
    .createSystemNotification({
      recipientId: userId,
      title: 'Password Changed',
      message:
        'Your password has been updated successfully. If you did not make this change, please contact support immediately.',
      referenceType: 'SYSTEM',
    })
    .catch(() => {});
};

const updatePrivacy = async (userId, updates) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      profileVisibility: true,
      emailVisibility: true,
      allowFollowers: true,
      allowMessages: true,
    },
  });

  return user;
};

const updateNotificationPreferences = async (userId, updates) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationPreferences: true },
  });

  if (!user) throw new ApiError(404, 'User not found.');

  const currentPrefs = user.notificationPreferences || {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  };

  const merged = { ...currentPrefs, ...updates };

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { notificationPreferences: merged },
    select: { notificationPreferences: true },
  });

  return updated.notificationPreferences;
};

const updatePreferences = async (userId, updates) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      language: true,
      timezone: true,
      themePreference: true,
    },
  });

  return user;
};

const uploadAvatar = async (userId, file) => {
  const { uploadToS3Mock } = require('../../utils/upload.util');

  if (file.size > IMAGE_MAX_SIZE) {
    throw new ApiError(400, 'File size must not exceed 5MB.');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  });

  const oldImage = user?.image;
  const url = await uploadToS3Mock(file);

  await prisma.user.update({
    where: { id: userId },
    data: { image: url },
  });

  if (oldImage) {
    await deleteFile(oldImage).catch(() => {});
  }

  return { url };
};

const uploadCoverImage = async (userId, file) => {
  const { uploadToS3Mock } = require('../../utils/upload.util');

  if (file.size > IMAGE_MAX_SIZE) {
    throw new ApiError(400, 'File size must not exceed 5MB.');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coverImage: true },
  });

  const oldCover = user?.coverImage;
  const url = await uploadToS3Mock(file);

  await prisma.user.update({
    where: { id: userId },
    data: { coverImage: url },
  });

  if (oldCover) {
    await deleteFile(oldCover).catch(() => {});
  }

  return { url };
};

const deleteAvatar = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  });

  if (!user) throw new ApiError(404, 'User not found.');

  if (user.image) {
    await deleteFile(user.image).catch(() => {});
  }

  await prisma.user.update({
    where: { id: userId },
    data: { image: null },
  });
};

const deleteCoverImage = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coverImage: true },
  });

  if (!user) throw new ApiError(404, 'User not found.');

  if (user.coverImage) {
    await deleteFile(user.coverImage).catch(() => {});
  }

  await prisma.user.update({
    where: { id: userId },
    data: { coverImage: null },
  });
};

const deleteAccount = async (userId, password) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true, image: true, coverImage: true },
  });

  if (!user) throw new ApiError(404, 'User not found.');

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Password is incorrect.');
  }

  if (user.image) {
    await deleteFile(user.image).catch(() => {});
  }
  if (user.coverImage) {
    await deleteFile(user.coverImage).catch(() => {});
  }

  await notificationService
    .createSystemNotification({
      recipientId: userId,
      title: 'Account Deleted',
      message: 'Your PixelThread account has been permanently deleted.',
      referenceType: 'SYSTEM',
    })
    .catch(() => {});

  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.like.deleteMany({ where: { userId } }),
    prisma.comment.deleteMany({ where: { userId } }),
    prisma.follow.deleteMany({ where: { followerId: userId } }),
    prisma.follow.deleteMany({ where: { followingId: userId } }),
    prisma.notification.deleteMany({ where: { recipientId: userId } }),
    prisma.notification.deleteMany({ where: { actorId: userId } }),
    prisma.searchHistory.deleteMany({ where: { userId } }),
    prisma.bookmark.deleteMany({ where: { userId } }),
    prisma.history.deleteMany({ where: { userId } }),
    prisma.report.deleteMany({ where: { reporterId: userId } }),
    prisma.report.deleteMany({ where: { resolvedBy: userId } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
};

module.exports = {
  getMySettings,
  updateProfile,
  changeEmail,
  verifyNewEmail,
  changePassword,
  updatePrivacy,
  updateNotificationPreferences,
  updatePreferences,
  uploadAvatar,
  uploadCoverImage,
  deleteAvatar,
  deleteCoverImage,
  deleteAccount,
};
