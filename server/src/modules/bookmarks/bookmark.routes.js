const { Router } = require('express');
const { protect } = require('../../middleware/auth.middleware');
const {
  bookmarkPost,
  removeBookmark,
  getMyBookmarks,
  getBookmarkStatus,
} = require('./bookmark.controller');

const router = Router();

router.get('/me/bookmarks', protect, getMyBookmarks);
router.post('/posts/:id/bookmark', protect, bookmarkPost);
router.delete('/posts/:id/bookmark', protect, removeBookmark);
router.get('/posts/:id/bookmark/status', protect, getBookmarkStatus);

module.exports = router;
