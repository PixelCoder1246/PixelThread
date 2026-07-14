const ApiError = require('../../utils/ApiError');

const ALLOWED_SORT = ['alphabetical', 'mostUsed'];

const validateCreateTag = (body) => {
  const { name } = body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new ApiError(400, 'Tag name is required.');
  }
};

const validatePagination = (query) => {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 10;
  if (page < 1) throw new ApiError(400, 'Page must be a positive integer.');
  if (limit < 1 || limit > 100)
    throw new ApiError(400, 'Limit must be between 1 and 100.');
  return { page, limit };
};

const validateTagSort = (query) => {
  const sort = query.sort || 'alphabetical';
  if (!ALLOWED_SORT.includes(sort)) {
    throw new ApiError(400, `Sort must be one of: ${ALLOWED_SORT.join(', ')}.`);
  }
  return sort;
};

module.exports = {
  validateCreateTag,
  validatePagination,
  validateTagSort,
};
