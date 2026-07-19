const { sendSuccess } = require('../../utils/ApiResponse');
const { validatePostId, validatePagination } = require('./bookmark.validation');
const bookmarkService = require('./bookmark.service');

const bookmarkPost = async (req, res, next) => {
  try {
    const postId = validatePostId(req.params);
    await bookmarkService.bookmarkPost(postId, req.user.id);
    return sendSuccess(res, 200, 'Post bookmarked successfully.');
  } catch (err) {
    next(err);
  }
};

const removeBookmark = async (req, res, next) => {
  try {
    const postId = validatePostId(req.params);
    await bookmarkService.removeBookmark(postId, req.user.id);
    return sendSuccess(res, 200, 'Bookmark removed successfully.');
  } catch (err) {
    next(err);
  }
};

const getMyBookmarks = async (req, res, next) => {
  try {
    const { page, limit, sort } = validatePagination(req.query);
    const result = await bookmarkService.getMyBookmarks(req.user.id, {
      page,
      limit,
      sort,
    });
    return sendSuccess(res, 200, 'Bookmarks fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const getBookmarkStatus = async (req, res, next) => {
  try {
    const postId = validatePostId(req.params);
    const result = await bookmarkService.getBookmarkStatus(postId, req.user.id);
    return sendSuccess(
      res,
      200,
      'Bookmark status fetched successfully.',
      result
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  bookmarkPost,
  removeBookmark,
  getMyBookmarks,
  getBookmarkStatus,
};
