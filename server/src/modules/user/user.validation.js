const ApiError = require('../../utils/ApiError');

const ALLOWED_SORT = ['newest', 'oldest'];

const validateUserPostsQuery = (query) => {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 10;
  let sort = query.sort || 'newest';

  if (page < 1) throw new ApiError(400, 'Page must be a positive integer.');
  if (limit < 1 || limit > 100)
    throw new ApiError(400, 'Limit must be between 1 and 100.');
  if (!ALLOWED_SORT.includes(sort)) {
    throw new ApiError(400, `Sort must be one of: ${ALLOWED_SORT.join(', ')}.`);
  }

  return { page, limit, sort };
};

module.exports = { validateUserPostsQuery };
