const { sendSuccess } = require('../../utils/ApiResponse');
const {
  validateHistoryId,
  validatePagination,
} = require('./history.validation');
const historyService = require('./history.service');

const getHistory = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const result = await historyService.getHistory(req.user.id, {
      page,
      limit,
    });
    return sendSuccess(
      res,
      200,
      'Reading history fetched successfully.',
      result
    );
  } catch (err) {
    next(err);
  }
};

const deleteHistoryItem = async (req, res, next) => {
  try {
    const historyId = validateHistoryId(req.params);
    await historyService.deleteHistoryItem(historyId, req.user.id);
    return sendSuccess(res, 200, 'History entry deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const clearHistory = async (req, res, next) => {
  try {
    await historyService.clearHistory(req.user.id);
    return sendSuccess(res, 200, 'Reading history cleared successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHistory,
  deleteHistoryItem,
  clearHistory,
};
