const ApiError = require('../../utils/ApiError');
const {
  REPORT_REASON_VALUES,
  REPORT_STATUS_VALUES,
  REPORT_TYPE_VALUES,
  RESOLUTION_ACTION_VALUES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MAX_DESCRIPTION_LENGTH,
  MAX_RESOLUTION_NOTE_LENGTH,
} = require('./report.constants');

const validateId = (params, name = 'id') => {
  const value = params[name];
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, `${name} is required.`);
  }
  return value.trim();
};

const validateCreateReport = (body) => {
  const { reason, description } = body;

  if (!reason || !REPORT_REASON_VALUES.includes(reason)) {
    throw new ApiError(
      400,
      `Reason must be one of: ${REPORT_REASON_VALUES.join(', ')}.`
    );
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      throw new ApiError(400, 'Description must be a string.');
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      throw new ApiError(
        400,
        `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters.`
      );
    }
  }

  return { reason, description: description || undefined };
};

const validatePagination = (query) => {
  const page = parseInt(query.page, 10) || DEFAULT_PAGE;
  const limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

  if (page < 1) throw new ApiError(400, 'Page must be a positive integer.');
  if (limit < 1 || limit > MAX_LIMIT) {
    throw new ApiError(400, `Limit must be between 1 and ${MAX_LIMIT}.`);
  }

  return { page, limit };
};

const validateReportFilters = (query) => {
  const filters = {};

  if (query.status) {
    if (!REPORT_STATUS_VALUES.includes(query.status)) {
      throw new ApiError(
        400,
        `Status must be one of: ${REPORT_STATUS_VALUES.join(', ')}.`
      );
    }
    filters.status = query.status;
  }

  if (query.reportType) {
    if (!REPORT_TYPE_VALUES.includes(query.reportType)) {
      throw new ApiError(
        400,
        `Report type must be one of: ${REPORT_TYPE_VALUES.join(', ')}.`
      );
    }
    filters.reportType = query.reportType;
  }

  if (query.reason) {
    if (!REPORT_REASON_VALUES.includes(query.reason)) {
      throw new ApiError(
        400,
        `Reason must be one of: ${REPORT_REASON_VALUES.join(', ')}.`
      );
    }
    filters.reportReason = query.reason;
  }

  if (query.sort) {
    if (!['newest', 'oldest'].includes(query.sort)) {
      throw new ApiError(400, 'Sort must be "newest" or "oldest".');
    }
    filters.sort = query.sort;
  }

  return filters;
};

const validateChangeStatus = (body) => {
  const { status } = body;

  if (!status || !REPORT_STATUS_VALUES.includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${REPORT_STATUS_VALUES.join(', ')}.`
    );
  }

  if (status === 'RESOLVED' || status === 'REJECTED') {
    throw new ApiError(
      400,
      'Use the dedicated resolve/reject endpoints for final statuses.'
    );
  }

  return { status };
};

const validateResolveReport = (body) => {
  const { action, resolutionNote } = body;

  if (!action || !RESOLUTION_ACTION_VALUES.includes(action)) {
    throw new ApiError(
      400,
      `Action must be one of: ${RESOLUTION_ACTION_VALUES.join(', ')}.`
    );
  }

  if (resolutionNote !== undefined && resolutionNote !== null) {
    if (typeof resolutionNote !== 'string') {
      throw new ApiError(400, 'Resolution note must be a string.');
    }
    if (resolutionNote.length > MAX_RESOLUTION_NOTE_LENGTH) {
      throw new ApiError(
        400,
        `Resolution note must not exceed ${MAX_RESOLUTION_NOTE_LENGTH} characters.`
      );
    }
  }

  return { action, resolutionNote: resolutionNote || undefined };
};

const validateRejectReport = (body) => {
  const { reason } = body;

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    throw new ApiError(400, 'Rejection reason is required.');
  }

  if (reason.length > MAX_RESOLUTION_NOTE_LENGTH) {
    throw new ApiError(
      400,
      `Reason must not exceed ${MAX_RESOLUTION_NOTE_LENGTH} characters.`
    );
  }

  return { reason: reason.trim() };
};

module.exports = {
  validateId,
  validateCreateReport,
  validatePagination,
  validateReportFilters,
  validateChangeStatus,
  validateResolveReport,
  validateRejectReport,
};
