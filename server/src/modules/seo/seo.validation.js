const ApiError = require('../../utils/ApiError');

const isValidId = (id) => typeof id === 'string' && id.length > 0;

const validateSeoUpdate = (body) => {
  const { metaTitle, metaDescription, keywords, canonicalUrl } = body;

  if (metaTitle !== undefined) {
    if (typeof metaTitle !== 'string')
      throw new ApiError(400, 'Meta title must be a string.');
    const trimmed = metaTitle.trim();
    if (trimmed.length === 0)
      throw new ApiError(400, 'Meta title cannot be empty.');
    if (trimmed.length > 200)
      throw new ApiError(400, 'Meta title must not exceed 200 characters.');
  }

  if (metaDescription !== undefined) {
    if (typeof metaDescription !== 'string')
      throw new ApiError(400, 'Meta description must be a string.');
    const trimmed = metaDescription.trim();
    if (trimmed.length === 0)
      throw new ApiError(400, 'Meta description cannot be empty.');
    if (trimmed.length > 350)
      throw new ApiError(
        400,
        'Meta description must not exceed 350 characters.'
      );
  }

  if (keywords !== undefined) {
    if (!Array.isArray(keywords))
      throw new ApiError(400, 'Keywords must be an array of strings.');
    if (keywords.length > 50)
      throw new ApiError(400, 'Keywords array must not exceed 50 entries.');
    for (let i = 0; i < keywords.length; i++) {
      if (typeof keywords[i] !== 'string' || keywords[i].trim().length === 0) {
        throw new ApiError(400, 'Each keyword must be a non-empty string.');
      }
      if (keywords[i].trim().length > 100) {
        throw new ApiError(400, 'Each keyword must not exceed 100 characters.');
      }
    }
  }

  if (canonicalUrl !== undefined) {
    if (typeof canonicalUrl !== 'string')
      throw new ApiError(400, 'Canonical URL must be a string.');
    const trimmed = canonicalUrl.trim();
    if (trimmed.length === 0)
      throw new ApiError(400, 'Canonical URL cannot be empty.');
    try {
      const url = new URL(trimmed);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new ApiError(
          400,
          'Canonical URL must have a valid HTTP or HTTPS protocol.'
        );
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(
        400,
        'Canonical URL is malformed. Provide a valid URL.'
      );
    }
    if (trimmed.length > 500)
      throw new ApiError(400, 'Canonical URL must not exceed 500 characters.');
  }
};

const validatePostIdParam = (params) => {
  const { id } = params;
  if (!id || !isValidId(id)) {
    throw new ApiError(400, 'Invalid post ID.');
  }
};

module.exports = { validateSeoUpdate, validatePostIdParam };
