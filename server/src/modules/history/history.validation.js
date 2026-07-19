const ApiError = require('../../utils/ApiError');
const {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} = require('./history.constants');

const validateHistoryId = (params) => {
  const { id } = params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new ApiError(400, 'History ID is required.');
  }
  return id.trim();
};

const validatePagination = (query) => {
  const page = parseInt(query.page, 10) || DEFAULT_PAGE;
  const limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

  if (page < 1) throw new ApiError(400, 'Page must be a positive integer.');
  if (limit < 1 || limit > MAX_LIMIT) {
    throw new ApiError(400, `Limit must be between 1 and ${MAX_LIMIT}.`);
  }

  return { page, limit };
};

module.exports = {
  validateHistoryId,
  validatePagination,
};
