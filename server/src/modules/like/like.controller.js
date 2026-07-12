const { sendSuccess } = require('../../utils/ApiResponse');
const { validatePagination } = require('./like.validation');
const likeService = require('./like.service');

const togglePostLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await likeService.togglePostLike(id, req.user.id);
    const message = result.liked
      ? 'Post liked successfully.'
      : 'Post unliked successfully.';
    return sendSuccess(res, 200, message, result);
  } catch (err) {
    next(err);
  }
};

const toggleCommentLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await likeService.toggleCommentLike(id, req.user.id);
    const message = result.liked
      ? 'Comment liked successfully.'
      : 'Comment unliked successfully.';
    return sendSuccess(res, 200, message, result);
  } catch (err) {
    next(err);
  }
};

const getPostLikes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = validatePagination(req.query);
    const result = await likeService.getPostLikes(id, page, limit);
    return sendSuccess(res, 200, 'Post likes fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const getCommentLikes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = validatePagination(req.query);
    const result = await likeService.getCommentLikes(id, page, limit);
    return sendSuccess(res, 200, 'Comment likes fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const getPostLikeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await likeService.getPostLikeStatus(id, req.user.id);
    return sendSuccess(
      res,
      200,
      'Post like status fetched successfully.',
      result
    );
  } catch (err) {
    next(err);
  }
};

const getCommentLikeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await likeService.getCommentLikeStatus(id, req.user.id);
    return sendSuccess(
      res,
      200,
      'Comment like status fetched successfully.',
      result
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  togglePostLike,
  toggleCommentLike,
  getPostLikes,
  getCommentLikes,
  getPostLikeStatus,
  getCommentLikeStatus,
};
