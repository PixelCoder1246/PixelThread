const ApiError = require('../../utils/ApiError');
const { NOTIFICATION_TYPE_VALUES } = require('./notification.constants');

const validateGetNotifications = (query) => {
  const { page, limit, type, read } = query;
  const result = {};

  const pageNum = parseInt(page, 10);
  result.page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const limitNum = parseInt(limit, 10);
  result.limit =
    Number.isFinite(limitNum) && limitNum > 0 && limitNum <= 100
      ? limitNum
      : 20;

  if (type) {
    if (!NOTIFICATION_TYPE_VALUES.includes(type)) {
      throw new ApiError(
        400,
        `Invalid notification type. Must be one of: ${NOTIFICATION_TYPE_VALUES.join(', ')}`
      );
    }
    result.type = type;
  }

  if (read !== undefined && read !== null) {
    if (read === 'true' || read === '1') {
      result.isRead = true;
    } else if (read === 'false' || read === '0') {
      result.isRead = false;
    } else {
      throw new ApiError(400, 'Invalid read filter. Use "true" or "false".');
    }
  }

  return result;
};

const validateNotificationId = (params) => {
  const { id } = params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new ApiError(400, 'Notification ID is required.');
  }
  return id.trim();
};

module.exports = {
  validateGetNotifications,
  validateNotificationId,
};
