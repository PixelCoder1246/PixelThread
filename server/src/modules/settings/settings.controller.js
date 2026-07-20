const { sendSuccess } = require('../../utils/ApiResponse');
const settingsService = require('./settings.service');
const {
  validateUpdateProfile,
  validateChangeEmail,
  validateChangePassword,
  validateUpdatePrivacy,
  validateNotificationPreferences,
  validatePreferences,
  validateDeleteAccount,
  validateImageType,
} = require('./settings.validation');

const getMySettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getMySettings(req.user.id);
    return sendSuccess(res, 200, 'Settings fetched successfully.', {
      settings,
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = validateUpdateProfile(req.body);
    const user = await settingsService.updateProfile(req.user.id, updates);
    return sendSuccess(res, 200, 'Profile updated successfully.', { user });
  } catch (err) {
    next(err);
  }
};

const changeEmail = async (req, res, next) => {
  try {
    const payload = validateChangeEmail(req.body);
    const result = await settingsService.changeEmail(req.user.id, payload);
    return sendSuccess(res, 200, result.message, {
      pendingEmail: result.pendingEmail,
    });
  } catch (err) {
    next(err);
  }
};

const verifyNewEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    await settingsService.verifyNewEmail(token);
    return sendSuccess(res, 200, 'Email verified successfully.');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const payload = validateChangePassword(req.body);
    await settingsService.changePassword(req.user.id, payload);
    return sendSuccess(
      res,
      200,
      'Password changed successfully. Please log in again.'
    );
  } catch (err) {
    next(err);
  }
};

const updatePrivacy = async (req, res, next) => {
  try {
    const updates = validateUpdatePrivacy(req.body);
    const privacy = await settingsService.updatePrivacy(req.user.id, updates);
    return sendSuccess(res, 200, 'Privacy settings updated successfully.', {
      privacy,
    });
  } catch (err) {
    next(err);
  }
};

const updateNotificationPreferences = async (req, res, next) => {
  try {
    const updates = validateNotificationPreferences(req.body);
    const preferences = await settingsService.updateNotificationPreferences(
      req.user.id,
      updates
    );
    return sendSuccess(
      res,
      200,
      'Notification preferences updated successfully.',
      {
        notificationPreferences: preferences,
      }
    );
  } catch (err) {
    next(err);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const updates = validatePreferences(req.body);
    const preferences = await settingsService.updatePreferences(
      req.user.id,
      updates
    );
    return sendSuccess(res, 200, 'Preferences updated successfully.', {
      preferences,
    });
  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res, next) => {
  uploadAvatar(req, res, next);
  try {
    validateImageType(req.file);
    const result = await settingsService.uploadAvatar(req.user.id, req.file);
    return sendSuccess(res, 200, 'Avatar uploaded successfully.', result);
  } catch (err) {
    next(err);
  }
};

const uploadCoverImage = async (req, res, next) => {
  try {
    validateImageType(req.file);
    const result = await settingsService.uploadCoverImage(
      req.user.id,
      req.file
    );
    return sendSuccess(res, 200, 'Cover image uploaded successfully.', result);
  } catch (err) {
    next(err);
  }
};

const deleteAvatar = async (req, res, next) => {
  try {
    await settingsService.deleteAvatar(req.user.id);
    return sendSuccess(res, 200, 'Avatar removed successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteCoverImage = async (req, res, next) => {
  try {
    await settingsService.deleteCoverImage(req.user.id);
    return sendSuccess(res, 200, 'Cover image removed successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const password = validateDeleteAccount(req.body);
    await settingsService.deleteAccount(req.user.id, password);
    return sendSuccess(res, 200, 'Account deleted successfully.');
  } catch (err) {
    next(err);
  }
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
