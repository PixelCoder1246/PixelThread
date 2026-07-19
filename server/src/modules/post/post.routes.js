const { Router } = require('express');
const {
  protect,
  verifiedOnly,
  optionalAuth,
} = require('../../middleware/auth.middleware');
const {
  createPost,
  getAllPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  searchPosts,
} = require('./post.controller');

const router = Router();

router.get('/', getAllPosts);
router.get('/search', searchPosts);
router.get('/:slug', optionalAuth, getPostBySlug);

const { upload } = require('../../utils/upload.util');

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
