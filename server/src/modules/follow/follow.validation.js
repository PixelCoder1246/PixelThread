const ApiError = require('../../utils/ApiError');

const validateUserId = (params) => {
  const { userId } = params;
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new ApiError(400, 'User ID is required.');
  }
  return userId.trim();
};

const validatePagination = (query) => {
  const { page, limit } = query;

  const pageNum = parseInt(page, 10);
  const resultPage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const limitNum = parseInt(limit, 10);
  const resultLimit =
    Number.isFinite(limitNum) && limitNum > 0 && limitNum <= 100
      ? limitNum
      : 20;

  return { page: resultPage, limit: resultLimit };
};

module.exports = {
  validateUserId,
  validatePagination,
};
