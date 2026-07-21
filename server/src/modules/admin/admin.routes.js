const { Router } = require('express');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const adminController = require('./admin.controller');

const router = Router();

const adminAuth = [protect, restrictTo('ADMIN', 'SUPER_ADMIN')];

// Dashboard
router.get('/dashboard', ...adminAuth, adminController.getDashboard);

// User Management
router.get('/users', ...adminAuth, adminController.getUsers);
router.get('/users/:id', ...adminAuth, adminController.getUser);
router.patch('/users/:id/role', ...adminAuth, adminController.updateUserRole);
router.patch('/users/:id/ban', ...adminAuth, adminController.banUser);
router.patch('/users/:id/unban', ...adminAuth, adminController.unbanUser);
router.patch('/users/:id/verify', ...adminAuth, adminController.verifyUser);

// Post Management
router.get('/posts', ...adminAuth, adminController.getPosts);
router.delete('/posts/:id', ...adminAuth, adminController.deletePost);
router.patch('/posts/:id/archive', ...adminAuth, adminController.archivePost);
router.patch('/posts/:id/restore', ...adminAuth, adminController.restorePost);
router.patch('/posts/:id/feature', ...adminAuth, adminController.featurePost);
router.patch(
  '/posts/:id/unfeature',
  ...adminAuth,
  adminController.unfeaturePost
);
router.patch('/posts/:id/pin', ...adminAuth, adminController.pinPost);
router.patch('/posts/:id/unpin', ...adminAuth, adminController.unpinPost);

// Comment Moderation
router.get('/comments', ...adminAuth, adminController.getComments);
router.delete('/comments/:id', ...adminAuth, adminController.deleteComment);
router.patch('/comments/:id/hide', ...adminAuth, adminController.hideComment);
router.patch(
  '/comments/:id/approve',
  ...adminAuth,
  adminController.approveComment
);

// Media Management
router.get('/media', ...adminAuth, adminController.getMediaList);
router.delete('/media/:id', ...adminAuth, adminController.deleteMedia);
router.get('/media/orphaned', ...adminAuth, adminController.getOrphanedMedia);
router.delete(
  '/media/orphaned',
  ...adminAuth,
  adminController.deleteOrphanedMedia
);

// Reports (reuse existing report module routes are already registered)
// Analytics
router.get('/analytics', ...adminAuth, adminController.getEnhancedAnalytics);

// Announcements
router.post('/announcements', ...adminAuth, adminController.createAnnouncement);
router.get('/announcements', ...adminAuth, adminController.getAnnouncements);
router.delete(
  '/announcements/:id',
  ...adminAuth,
  adminController.deleteAnnouncement
);

// Audit Logs
router.get('/audit-logs', ...adminAuth, adminController.getAuditLogs);
router.get('/audit-logs/stats', ...adminAuth, adminController.getAuditLogStats);

// Search
router.get('/search', ...adminAuth, adminController.adminSearch);

// Platform Settings
router.get('/settings', ...adminAuth, adminController.getPlatformSettings);
router.patch('/settings', ...adminAuth, adminController.updatePlatformSettings);

module.exports = router;
