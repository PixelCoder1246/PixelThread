const { sendSuccess } = require('../../utils/ApiResponse');
const { validateUserId, validatePagination } = require('./follow.validation');
const followService = require('./follow.service');

const followUser = async (req, res, next) => {
  try {
    const userId = validateUserId(req.params);
    const result = await followService.followUser(req.user.id, userId);
    return sendSuccess(res, 200, 'User followed successfully.', result);
  } catch (err) {
    next(err);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const userId = validateUserId(req.params);
    const result = await followService.unfollowUser(req.user.id, userId);
    return sendSuccess(res, 200, 'User unfollowed successfully.', result);
  } catch (err) {
    next(err);
  }
};

const getFollowers = async (req, res, next) => {
  try {
    const userId = validateUserId(req.params);
    const { page, limit } = validatePagination(req.query);
    const result = await followService.getFollowers(userId, page, limit);
    return sendSuccess(res, 200, 'Followers fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const userId = validateUserId(req.params);
    const { page, limit } = validatePagination(req.query);
    const result = await followService.getFollowing(userId, page, limit);
    return sendSuccess(res, 200, 'Following fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
