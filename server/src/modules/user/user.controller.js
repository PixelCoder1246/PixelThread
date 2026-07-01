const { sendSuccess } = require('../../utils/ApiResponse');
const { validateUserPostsQuery } = require('./user.validation');
const userService = require('./user.service');

const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, sort } = validateUserPostsQuery(req.query);
    const currentUserId = req.user ? req.user.id : null;

    const result = await userService.getUserPosts({
      userId: id,
      page,
      limit,
      sort,
      currentUserId,
    });

    const message =
      result.posts.length === 0
        ? 'No posts found for this user.'
        : 'User posts fetched successfully.';

    return sendSuccess(res, 200, message, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserPosts };
