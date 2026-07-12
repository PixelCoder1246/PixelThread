const ApiError = require('../../utils/ApiError');

const MAX_CONTENT_LENGTH = 2000;

const validateContent = (content) => {
  if (!content || typeof content !== 'string') {
    throw new ApiError(400, 'Content is required and must be a string.');
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    throw new ApiError(400, 'Content cannot be empty.');
  }

  if (trimmed.length > MAX_CONTENT_LENGTH) {
    throw new ApiError(
      400,
      `Content must not exceed ${MAX_CONTENT_LENGTH} characters.`
    );
  }

  return trimmed;
};

const validateCreateComment = (body) => {
  return validateContent(body.content);
};

const validateUpdateComment = (body) => {
  return validateContent(body.content);
};

module.exports = { validateCreateComment, validateUpdateComment };
