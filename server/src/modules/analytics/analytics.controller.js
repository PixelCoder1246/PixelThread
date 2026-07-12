const { sendSuccess } = require('../../utils/ApiResponse');
const {
  validatePostAnalyticsSort,
  validateTopPostsQuery,
} = require('./analytics.validation');
const analyticsService = require('./analytics.service');

const recordView = async (req, res, next) => {
  try {
    const { id } = req.params;
    await analyticsService.recordView(id);
    return sendSuccess(res, 200, 'View recorded');
  } catch (err) {
    next(err);
  }
};

const getPostAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await analyticsService.getPostAnalytics(id);
    return sendSuccess(res, 200, 'Post analytics fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const getMyAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getMyOverallAnalytics(req.user.id);
    return sendSuccess(res, 200, 'My analytics fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const getMyPostsAnalytics = async (req, res, next) => {
  try {
    const { page, limit, sort } = validatePostAnalyticsSort(req.query);
    const data = await analyticsService.getMyPostsAnalytics({
      userId: req.user.id,
      page,
      limit,
      sort,
    });
    return sendSuccess(
      res,
      200,
      'My posts analytics fetched successfully.',
      data
    );
  } catch (err) {
    next(err);
  }
};

const getMyTopPosts = async (req, res, next) => {
  try {
    const { limit, sort } = validateTopPostsQuery(req.query);
    const data = await analyticsService.getTopPosts({
      userId: req.user.id,
      limit,
      sort,
    });
    return sendSuccess(res, 200, 'Top posts fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const getAdminAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getAdminAnalytics();
    return sendSuccess(res, 200, 'Admin analytics fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  recordView,
  getPostAnalytics,
  getMyAnalytics,
  getMyPostsAnalytics,
  getMyTopPosts,
  getAdminAnalytics,
};
