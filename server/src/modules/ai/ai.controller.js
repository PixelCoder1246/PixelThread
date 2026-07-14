const { sendSuccess } = require('../../utils/ApiResponse');
const aiService = require('./ai.service');
const {
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
} = require('./ai.validation');
const { sanitizeObject } = require('./ai.utils');

const generatePost = async (req, res, next) => {
  try {
    validateGeneratePost(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.generatePost(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Blog post generated successfully.', result);
  } catch (err) {
    next(err);
  }
};

const generateTitles = async (req, res, next) => {
  try {
    validateTitle(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.generateTitles(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Titles generated successfully.', result);
  } catch (err) {
    next(err);
  }
};

const improveTitle = async (req, res, next) => {
  try {
    validateImproveTitle(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.improveTitle(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Title improved successfully.', result);
  } catch (err) {
    next(err);
  }
};

const generateExcerpt = async (req, res, next) => {
  try {
    validateExcerpt(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.generateExcerpt(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Excerpt generated successfully.', result);
  } catch (err) {
    next(err);
  }
};

const generateTags = async (req, res, next) => {
  try {
    validateTags(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.generateTags(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Tags generated successfully.', result);
  } catch (err) {
    next(err);
  }
};

const generateSEO = async (req, res, next) => {
  try {
    validateSEO(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.generateSEO(sanitized, req.user.id);
    return sendSuccess(
      res,
      200,
      'SEO metadata generated successfully.',
      result
    );
  } catch (err) {
    next(err);
  }
};

const improveWriting = async (req, res, next) => {
  try {
    validateImprove(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.improveWriting(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Content improved successfully.', result);
  } catch (err) {
    next(err);
  }
};

const rewriteContent = async (req, res, next) => {
  try {
    validateRewrite(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.rewriteContent(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Content rewritten successfully.', result);
  } catch (err) {
    next(err);
  }
};

const expandContent = async (req, res, next) => {
  try {
    validateExpand(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.expandContent(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Content expanded successfully.', result);
  } catch (err) {
    next(err);
  }
};

const shortenContent = async (req, res, next) => {
  try {
    validateShorten(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.shortenContent(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Content shortened successfully.', result);
  } catch (err) {
    next(err);
  }
};

const continueWriting = async (req, res, next) => {
  try {
    validateContinue(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.continueWriting(sanitized, req.user.id);
    return sendSuccess(
      res,
      200,
      'Content continuation generated successfully.',
      result
    );
  } catch (err) {
    next(err);
  }
};

const summarizeContent = async (req, res, next) => {
  try {
    validateSummarize(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.summarizeContent(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Summary generated successfully.', result);
  } catch (err) {
    next(err);
  }
};

const generateFAQ = async (req, res, next) => {
  try {
    validateFAQ(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.generateFAQ(sanitized, req.user.id);
    return sendSuccess(res, 200, 'FAQs generated successfully.', result);
  } catch (err) {
    next(err);
  }
};

const generateSocialPosts = async (req, res, next) => {
  try {
    validateSocial(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.generateSocialPosts(sanitized, req.user.id);
    return sendSuccess(
      res,
      200,
      'Social posts generated successfully.',
      result
    );
  } catch (err) {
    next(err);
  }
};

const generateSuggestions = async (req, res, next) => {
  try {
    validateSuggestions(req.body);
    const sanitized = sanitizeObject(req.body);
    const result = await aiService.generateSuggestions(sanitized, req.user.id);
    return sendSuccess(res, 200, 'Suggestions generated successfully.', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generatePost,
  generateTitles,
  improveTitle,
  generateExcerpt,
  generateTags,
  generateSEO,
  improveWriting,
  rewriteContent,
  expandContent,
  shortenContent,
  continueWriting,
  summarizeContent,
  generateFAQ,
  generateSocialPosts,
  generateSuggestions,
};
