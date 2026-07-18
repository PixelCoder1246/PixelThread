const ApiError = require('../../utils/ApiError');
const { AI_TONES, AI_CATEGORIES, AI_LENGTHS } = require('./ai.constants');

const validateGeneratePost = (body) => {
  const { topic, tone, category, approximateLength } = body;
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    throw new ApiError(
      400,
      'Topic is required and must be a non-empty string.'
    );
  }
  if (topic.trim().length > 500) {
    throw new ApiError(400, 'Topic must not exceed 500 characters.');
  }
  if (tone && !AI_TONES.includes(tone.toLowerCase())) {
    throw new ApiError(400, `Tone must be one of: ${AI_TONES.join(', ')}.`);
  }
  if (category && !AI_CATEGORIES.includes(category.toLowerCase())) {
    throw new ApiError(
      400,
      `Category must be one of: ${AI_CATEGORIES.join(', ')}.`
    );
  }
  if (approximateLength && !AI_LENGTHS[approximateLength.toLowerCase()]) {
    throw new ApiError(
      400,
      `Length must be one of: ${Object.keys(AI_LENGTHS).join(', ')}.`
    );
  }
};

const validateTitle = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Blog content is required.');
  }
  if (content.trim().length < 50) {
    throw new ApiError(400, 'Blog content must be at least 50 characters.');
  }
};

const validateImproveTitle = (body) => {
  const { currentTitle } = body;
  if (
    !currentTitle ||
    typeof currentTitle !== 'string' ||
    currentTitle.trim().length === 0
  ) {
    throw new ApiError(400, 'Current title is required.');
  }
  if (currentTitle.trim().length > 200) {
    throw new ApiError(400, 'Title must not exceed 200 characters.');
  }
};

const validateExcerpt = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateTags = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateSEO = (body) => {
  const { title, content } = body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new ApiError(400, 'Title is required.');
  }
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateImprove = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateRewrite = (body) => {
  const { content, tone } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
  if (!tone || !AI_TONES.includes(tone.toLowerCase())) {
    throw new ApiError(400, `Tone must be one of: ${AI_TONES.join(', ')}.`);
  }
};

const validateExpand = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateShorten = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateContinue = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateSummarize = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateFAQ = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateSocial = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateSuggestions = (body) => {
  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
};

const validateApplySuggestions = (body) => {
  const { content, suggestions } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ApiError(400, 'Content is required.');
  }
  if (content.trim().length < 50) {
    throw new ApiError(400, 'Content must be at least 50 characters.');
  }
  if (suggestions !== undefined) {
    if (!Array.isArray(suggestions)) {
      throw new ApiError(400, 'Suggestions must be an array.');
    }
    if (suggestions.length === 0) {
      throw new ApiError(400, 'Suggestions array must not be empty.');
    }
  }
};

module.exports = {
  validateGeneratePost,
  validateTitle,
  validateImproveTitle,
  validateExcerpt,
  validateTags,
  validateSEO,
  validateImprove,
  validateRewrite,
  validateExpand,
  validateShorten,
  validateContinue,
  validateSummarize,
  validateFAQ,
  validateSocial,
  validateSuggestions,
  validateApplySuggestions,
};
