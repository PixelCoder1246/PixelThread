const { Router } = require('express');
const { protect, optionalAuth } = require('../../middleware/auth.middleware');
const {
  togglePostLike,
  toggleCommentLike,
  getPostLikes,
  getCommentLikes,
  getPostLikeStatus,
  getCommentLikeStatus,
} = require('./like.controller');

const router = Router();

router.post('/posts/:id/like', protect, togglePostLike);
router.post('/comments/:id/like', protect, toggleCommentLike);

router.get('/posts/:id/likes', optionalAuth, getPostLikes);
router.get('/comments/:id/likes', optionalAuth, getCommentLikes);

router.get('/posts/:id/like-status', protect, getPostLikeStatus);
router.get('/comments/:id/like-status', protect, getCommentLikeStatus);

module.exports = router;
