const { Router } = require('express');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const {
  getMyNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  deleteAllRead,
  getUnreadCount,
  broadcastSystemNotification,
} = require('./notification.controller');

const router = Router();

router.get('/unread-count', protect, getUnreadCount);
router.get('/', protect, getMyNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markNotificationRead);
router.delete('/read', protect, deleteAllRead);
router.delete('/:id', protect, deleteNotification);
router.post(
  '/broadcast',
  protect,
  restrictTo('ADMIN'),
  broadcastSystemNotification
);

module.exports = router;
