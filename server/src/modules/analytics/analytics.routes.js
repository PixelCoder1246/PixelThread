const { Router } = require('express');
const { protect, restrictTo, optionalAuth } = require('../../middleware/auth.middleware');
const {
  recordView,
  getPostAnalytics,
  getMyAnalytics,
  getMyPostsAnalytics,
  getMyTopPosts,
  getAdminAnalytics,
  getPublicAnalytics,
} = require('./analytics.controller');

const router = Router();

router.post('/posts/:id/view', optionalAuth, recordView);
router.get('/posts/:id/analytics', getPostAnalytics);

router.get('/me/analytics', protect, getMyAnalytics);
router.get('/me/posts/analytics', protect, getMyPostsAnalytics);
router.get('/me/posts/top', protect, getMyTopPosts);

router.get('/admin/analytics', protect, restrictTo('ADMIN'), getAdminAnalytics);
router.get('/analytics/public', getPublicAnalytics);

module.exports = router;
