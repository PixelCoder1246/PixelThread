const ApiError = require('../../utils/ApiError');

const ALLOWED_STATUSES = ['DRAFT', 'PUBLISHED'];
const ALLOWED_VISIBILITIES = ['PUBLIC', 'PRIVATE'];

/**
 * Validates request body for creating a post.
 * Throws ApiError on failure.
 */
const validateCreatePost = (body) => {
  const { title, content, status, visibility } = body;

  // title — required, 3–200 chars
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new ApiError(400, 'Title is required.');
  }
  if (title.trim().length < 3 || title.trim().length > 200) {
    throw new ApiError(400, 'Title must be between 3 and 200 characters.');
  }

  // content — required, must be a non-empty array of blocks
  if (!content || !Array.isArray(content) || content.length === 0) {
    throw new ApiError(400, 'Content must be a non-empty array of blocks.');
  }

  // status — optional, but must be DRAFT or PUBLISHED if provided
  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${ALLOWED_STATUSES.join(', ')}. Use ARCHIVED only after publication.`
    );
  }

  // visibility — optional, must be PUBLIC or PRIVATE if provided
  if (visibility !== undefined && !ALLOWED_VISIBILITIES.includes(visibility)) {
    throw new ApiError(
      400,
      `Visibility must be one of: ${ALLOWED_VISIBILITIES.join(', ')}.`
    );
  }
};

/**
 * Validates request body for updating a post.
 * All fields optional — only validates what is present.
 * Throws ApiError on failure.
 */
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

  // On update, ARCHIVED is also allowed
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

/**
 * Validates pagination query params.
 * Returns { page, limit } as integers.
 * Throws ApiError on invalid values.
 */
const validatePagination = (query) => {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 10;

  if (page < 1) throw new ApiError(400, 'Page must be a positive integer.');
  if (limit < 1 || limit > 100)
    throw new ApiError(400, 'Limit must be between 1 and 100.');

  return { page, limit };
};

module.exports = { validateCreatePost, validateUpdatePost, validatePagination };
