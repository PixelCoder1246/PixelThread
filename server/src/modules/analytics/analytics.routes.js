const { Router } = require('express');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const {
  recordView,
  getPostAnalytics,
  getMyAnalytics,
  getMyPostsAnalytics,
  getMyTopPosts,
  getAdminAnalytics,
} = require('./analytics.controller');

const router = Router();

router.post('/posts/:id/view', recordView);
router.get('/posts/:id/analytics', getPostAnalytics);

router.get('/me/analytics', protect, getMyAnalytics);
router.get('/me/posts/analytics', protect, getMyPostsAnalytics);
router.get('/me/posts/top', protect, getMyTopPosts);

router.get('/admin/analytics', protect, restrictTo('ADMIN'), getAdminAnalytics);

module.exports = router;
