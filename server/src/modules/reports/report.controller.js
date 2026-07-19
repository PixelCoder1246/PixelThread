const { sendSuccess } = require('../../utils/ApiResponse');
const reportService = require('./report.service');
const {
  validateCreateReport,
  validatePagination,
  validateReportFilters,
  validateChangeStatus,
  validateResolveReport,
  validateRejectReport,
} = require('./report.validation');

const reportPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, description } = validateCreateReport(req.body);
    const result = await reportService.createReport(req.user.id, 'POST', id, {
      reason,
      description,
    });
    return sendSuccess(res, 201, result.message);
  } catch (err) {
    next(err);
  }
};

const reportComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, description } = validateCreateReport(req.body);
    const result = await reportService.createReport(
      req.user.id,
      'COMMENT',
      id,
      { reason, description }
    );
    return sendSuccess(res, 201, result.message);
  } catch (err) {
    next(err);
  }
};

const reportUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, description } = validateCreateReport(req.body);
    const result = await reportService.createReport(req.user.id, 'USER', id, {
      reason,
      description,
    });
    return sendSuccess(res, 201, result.message);
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const filters = validateReportFilters(req.query);
    const result = await reportService.getReports({ page, limit, ...filters });
    return sendSuccess(res, 200, 'Reports fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await reportService.getReportById(id);
    return sendSuccess(res, 200, 'Report fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const changeReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = validateChangeStatus(req.body);
    const result = await reportService.changeReportStatus(id, req.user.id, {
      status,
    });
    return sendSuccess(res, 200, 'Report status updated successfully.', result);
  } catch (err) {
    next(err);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, resolutionNote } = validateResolveReport(req.body);
    const result = await reportService.resolveReport(id, req.user.id, {
      action,
      resolutionNote,
    });
    return sendSuccess(res, 200, 'Report resolved successfully.', result);
  } catch (err) {
    next(err);
  }
};

const rejectReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = validateRejectReport(req.body);
    const result = await reportService.rejectReport(id, req.user.id, {
      reason,
    });
    return sendSuccess(res, 200, 'Report rejected successfully.', result);
  } catch (err) {
    next(err);
  }
};

const getReportAnalytics = async (req, res, next) => {
  try {
    const result = await reportService.getReportAnalytics();
    return sendSuccess(
      res,
      200,
      'Report analytics fetched successfully.',
      result
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  reportPost,
  reportComment,
  reportUser,
  getReports,
  getReportById,
  changeReportStatus,
  resolveReport,
  rejectReport,
  getReportAnalytics,
};
