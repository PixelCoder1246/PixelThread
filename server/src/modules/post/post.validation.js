const ApiError = require('../../utils/ApiError');

const ALLOWED_STATUSES = ['DRAFT', 'PUBLISHED'];
const ALLOWED_VISIBILITIES = ['PUBLIC', 'PRIVATE'];

const validateCreatePost = (body) => {
  const { title, content, status, visibility } = body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new ApiError(400, 'Title is required.');
  }
  if (title.trim().length < 3 || title.trim().length > 200) {
    throw new ApiError(400, 'Title must be between 3 and 200 characters.');
  }

  if (!content || !Array.isArray(content) || content.length === 0) {
    throw new ApiError(400, 'Content must be a non-empty array of blocks.');
  }

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${ALLOWED_STATUSES.join(', ')}. Use ARCHIVED only after publication.`
    );
  }

  if (visibility !== undefined && !ALLOWED_VISIBILITIES.includes(visibility)) {
    throw new ApiError(
      400,
      `Visibility must be one of: ${ALLOWED_VISIBILITIES.join(', ')}.`
    );
  }
};

const validateUpdatePost = (body) => {
  const { title, content, status, visibility } = body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new ApiError(400, 'Title must be a non-empty string.');
    }
    if (title.trim().length < 3 || title.trim().length > 200) {
      throw new ApiError(400, 'Title must be between 3 and 200 characters.');
    }
  }

  if (content !== undefined) {
    if (!Array.isArray(content) || content.length === 0) {
      throw new ApiError(400, 'Content must be a non-empty array of blocks.');
    }
  }

  const UPDATE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
  if (status !== undefined && !UPDATE_STATUSES.includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${UPDATE_STATUSES.join(', ')}.`
    );
  }

  if (visibility !== undefined && !ALLOWED_VISIBILITIES.includes(visibility)) {
    throw new ApiError(
      400,
      `Visibility must be one of: ${ALLOWED_VISIBILITIES.join(', ')}.`
    );
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

const ALLOWED_SEARCH_SORT = [
  'relevance',
  'newest',
  'oldest',
  'mostViewed',
  'mostLiked',
];

const validateSearchPosts = (query) => {
  const { q, tag, authorId, sort: sortParam } = query;

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    throw new ApiError(400, 'Search query (q) is required.');
  }

  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 10;

  if (page < 1) throw new ApiError(400, 'Page must be a positive integer.');
  if (limit < 1 || limit > 100)
    throw new ApiError(400, 'Limit must be between 1 and 100.');

  const sort = sortParam || 'relevance';
  if (!ALLOWED_SEARCH_SORT.includes(sort)) {
    throw new ApiError(
      400,
      `Sort must be one of: ${ALLOWED_SEARCH_SORT.join(', ')}.`
    );
  }

  return {
    q: q.trim(),
    tag: tag || undefined,
    authorId: authorId || undefined,
    page,
    limit,
    sort,
  };
};

module.exports = {
  validateCreatePost,
  validateUpdatePost,
  validatePagination,
  validateSearchPosts,
};
