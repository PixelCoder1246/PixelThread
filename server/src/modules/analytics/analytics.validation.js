const ApiError = require('../../utils/ApiError');

const ALLOWED_POST_SORT = ['newest', 'oldest', 'mostViewed', 'mostLiked'];
const ALLOWED_TOP_SORT = ['views', 'likes'];

const validatePagination = (query) => {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 10;

  if (page < 1) throw new ApiError(400, 'Page must be a positive integer.');
  if (limit < 1 || limit > 100)
    throw new ApiError(400, 'Limit must be between 1 and 100.');

  return { page, limit };
};

const validatePostAnalyticsSort = (query) => {
  const { page, limit } = validatePagination(query);
  let sort = query.sort || 'newest';

  if (!ALLOWED_POST_SORT.includes(sort)) {
    throw new ApiError(
      400,
      `Sort must be one of: ${ALLOWED_POST_SORT.join(', ')}.`
    );
  }

  return { page, limit, sort };
};

const validateTopPostsQuery = (query) => {
  let limit = parseInt(query.limit, 10) || 5;
  let sort = query.sort || 'views';

  if (limit < 1 || limit > 50)
    throw new ApiError(400, 'Limit must be between 1 and 50.');
  if (!ALLOWED_TOP_SORT.includes(sort)) {
    throw new ApiError(
      400,
      `Sort must be one of: ${ALLOWED_TOP_SORT.join(', ')}.`
    );
  }

  return { limit, sort };
};

module.exports = { validatePostAnalyticsSort, validateTopPostsQuery };
