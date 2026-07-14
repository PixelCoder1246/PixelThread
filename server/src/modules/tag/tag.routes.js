const { Router } = require('express');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const {
  getAllTags,
  getTagPosts,
  createTag,
  deleteTag,
} = require('./tag.controller');

const router = Router();

router.get('/', getAllTags);
router.get('/:name/posts', getTagPosts);
router.post('/', protect, restrictTo('ADMIN'), createTag);
router.delete('/:id', protect, restrictTo('ADMIN'), deleteTag);

module.exports = router;
