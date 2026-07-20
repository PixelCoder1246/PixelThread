const { Router } = require('express');
const { protect } = require('../../middleware/auth.middleware');
const { upload } = require('../../utils/upload.util');
const {
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
} = require('./settings.controller');

const router = Router();

router.get('/me/settings', protect, getMySettings);
router.patch('/me/profile', protect, updateProfile);
router.patch('/me/email', protect, changeEmail);
router.get('/me/email/verify', verifyNewEmail);
router.patch('/me/password', protect, changePassword);
router.patch('/me/privacy', protect, updatePrivacy);
router.patch('/me/notifications', protect, updateNotificationPreferences);
router.patch('/me/preferences', protect, updatePreferences);

router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/me/cover', protect, upload.single('cover'), uploadCoverImage);
router.delete('/me/avatar', protect, deleteAvatar);
router.delete('/me/cover', protect, deleteCoverImage);

router.delete('/me', protect, deleteAccount);

module.exports = router;
