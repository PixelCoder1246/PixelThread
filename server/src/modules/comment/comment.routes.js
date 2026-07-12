const { Router } = require('express');
const {
  protect,
  verifiedOnly,
  optionalAuth,
} = require('../../middleware/auth.middleware');
const {
  getThreadedComments,
  createComment,
  createReply,
  updateComment,
  deleteComment,
  getReplies,
} = require('./comment.controller');

const router = Router();

router.get('/posts/:postId/comments', optionalAuth, getThreadedComments);
router.get('/comments/:id/replies', optionalAuth, getReplies);

router.post('/posts/:postId/comments', protect, verifiedOnly, createComment);
router.post('/comments/:id/replies', protect, verifiedOnly, createReply);
router.patch('/comments/:id', protect, verifiedOnly, updateComment);
router.delete('/comments/:id', protect, verifiedOnly, deleteComment);

module.exports = router;
