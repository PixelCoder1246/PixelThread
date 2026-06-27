const { Router } = require('express');
const { protect, verifiedOnly } = require('../../middleware/auth.middleware');
const {
  createPost,
  getAllPosts,
  getPostBySlug,
  updatePost,
  deletePost,
} = require('./post.controller');

const router = Router();

// Public — no auth required
router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);

const { upload } = require('../../utils/upload.util');

// Auth + email verification required for write operations
router.post('/', protect, verifiedOnly, upload.array('files', 10), createPost);
router.put(
  '/:id',
  protect,
  verifiedOnly,
  upload.array('files', 10),
  updatePost
);
router.delete('/:id', protect, verifiedOnly, deletePost);

module.exports = router;
