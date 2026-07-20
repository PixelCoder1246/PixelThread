const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const logger = require('../../config/logger');

const uploadsDir = path.join(__dirname, '../../../public/uploads');

const deleteFile = async (fileUrl) => {
  if (!fileUrl) return;
  const filename =
    typeof fileUrl === 'string' && fileUrl.includes('/uploads/')
      ? fileUrl.split('/uploads/').pop()
      : null;
  if (!filename || filename === 'default') return;
  const filePath = path.join(uploadsDir, filename);
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error('Failed to delete file', { filePath, error: err.message });
    }
  }
};

const sanitizeUserSettings = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  username: user.username,
  bio: user.bio,
  location: user.location,
  website: user.website,
  coverImage: user.coverImage,
  socialLinks: user.socialLinks,
  profileVisibility: user.profileVisibility,
  emailVisibility: user.emailVisibility,
  allowFollowers: user.allowFollowers,
  allowMessages: user.allowMessages,
  notificationPreferences: user.notificationPreferences,
  language: user.language,
  timezone: user.timezone,
  themePreference: user.themePreference,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const userSettingsSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  isEmailVerified: true,
  username: true,
  bio: true,
  location: true,
  website: true,
  coverImage: true,
  socialLinks: true,
  profileVisibility: true,
  emailVisibility: true,
  allowFollowers: true,
  allowMessages: true,
  notificationPreferences: true,
  language: true,
  timezone: true,
  themePreference: true,
  createdAt: true,
  updatedAt: true,
};

const hashPassword = async (password) => bcrypt.hash(password, 12);

const generateSecureToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

module.exports = {
  deleteFile,
  sanitizeUserSettings,
  userSettingsSelect,
  hashPassword,
  generateSecureToken,
  hashToken,
};
