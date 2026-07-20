const ApiError = require('../../utils/ApiError');
const {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  ALLOWED_SORT_OPTIONS,
  MAX_LIMIT,
} = require('./media.constants');

const path = require('path');

const validateUpload = (file) => {
  if (!file) {
    throw new ApiError(400, 'No file provided.');
  }

  if (!file.buffer && !file.path) {
    throw new ApiError(400, 'Invalid file data.');
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new ApiError(
      400,
      `Invalid file extension "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new ApiError(
      400,
      `Invalid file type "${file.mimetype}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }

  const fileSize = file.size || (file.buffer ? file.buffer.length : 0);
  if (fileSize > MAX_FILE_SIZE) {
    throw new ApiError(
      400,
      `File size exceeds maximum of ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`
    );
  }

  const sanitizedName = path
    .basename(file.originalname)
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  if (sanitizedName.length === 0) {
    throw new ApiError(400, 'Invalid filename.');
  }

  return sanitizedName;
};

const validateMediaId = (params) => {
  const { id } = params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new ApiError(400, 'Media ID is required.');
  }
  return id.trim();
};

const validatePagination = (query) => {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 20;

  if (page < 1) throw new ApiError(400, 'Page must be a positive integer.');
  if (limit < 1 || limit > MAX_LIMIT) {
    throw new ApiError(400, `Limit must be between 1 and ${MAX_LIMIT}.`);
  }

  const sort = query.sort || 'newest';
  if (!ALLOWED_SORT_OPTIONS.includes(sort)) {
    throw new ApiError(
      400,
      `Sort must be one of: ${ALLOWED_SORT_OPTIONS.join(', ')}`
    );
  }

  return { page, limit, sort };
};

module.exports = {
  validateUpload,
  validateMediaId,
  validatePagination,
};
