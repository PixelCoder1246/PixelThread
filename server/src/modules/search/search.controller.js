const { sendSuccess } = require('../../utils/ApiResponse');
const {
  validateSearchQuery,
  validateSuggestionsQuery,
  validatePagination,
} = require('./search.validation');
const searchService = require('./search.service');

const globalSearch = async (req, res, next) => {
  try {
    const query = validateSearchQuery(req.query);
    const user = req.user || null;

    const result = await searchService.globalSearch(query, user);

    if (user) {
      await searchService.recordHistory(user.id, query.q);
    }
    await searchService.recordTrending(query.q.toLowerCase());

    return sendSuccess(res, 200, 'Search completed successfully.', result);
  } catch (err) {
    next(err);
  }
};

const getSuggestions = async (req, res, next) => {
  try {
    const { q } = validateSuggestionsQuery(req.query);
    const suggestions = await searchService.getSuggestions(q);
    return sendSuccess(
      res,
      200,
      'Suggestions fetched successfully.',
      suggestions
    );
  } catch (err) {
    next(err);
  }
};

const getTrending = async (req, res, next) => {
  try {
    const trending = await searchService.getTrending();
    return sendSuccess(
      res,
      200,
      'Trending searches fetched successfully.',
      trending
    );
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await searchService.getHistory(req.user.id);
    return sendSuccess(
      res,
      200,
      'Search history fetched successfully.',
      history
    );
  } catch (err) {
    next(err);
  }
};

const deleteHistory = async (req, res, next) => {
  try {
    await searchService.deleteHistory(req.user.id);
    return sendSuccess(res, 200, 'Search history deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const getPopularTags = async (req, res, next) => {
  try {
    const tags = await searchService.getPopularTags();
    return sendSuccess(res, 200, 'Popular tags fetched successfully.', tags);
  } catch (err) {
    next(err);
  }
};

const getDiscoverAuthors = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const result = await searchService.getDiscoverAuthors({ page, limit });
    return sendSuccess(res, 200, 'Authors fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  globalSearch,
  getSuggestions,
  getTrending,
  getHistory,
  deleteHistory,
  getPopularTags,
  getDiscoverAuthors,
};
