const prisma = require('../../config/db');
const { sendSuccess } = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const {
  validateGetNotifications,
  validateNotificationId,
} = require('./notification.validation');
const notificationService = require('./notification.service');

const getMyNotifications = async (req, res, next) => {
  try {
    const filters = validateGetNotifications(req.query);
    const result = await notificationService.getNotifications(
      req.user.id,
      filters
    );
    return sendSuccess(res, 200, 'Notifications fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const id = validateNotificationId(req.params);
    const notification = await notificationService.markAsRead(id, req.user.id);
    return sendSuccess(res, 200, 'Notification marked as read.', {
      notification,
    });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return sendSuccess(res, 200, 'All notifications marked as read.', result);
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const id = validateNotificationId(req.params);
    await notificationService.deleteNotification(id, req.user.id);
    return sendSuccess(res, 200, 'Notification deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.deleteAllRead(req.user.id);
    return sendSuccess(
      res,
      200,
      'Read notifications deleted successfully.',
      result
    );
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);
    return sendSuccess(res, 200, 'Unread count fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const broadcastSystemNotification = async (req, res, next) => {
  try {
    const { title, message, userIds } = req.body;
    if (!title || !message) {
      throw new ApiError(400, 'Title and message are required.');
    }

    let result;
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      result = await notificationService.createBulkSystemNotifications({
        userIds,
        title,
        message,
      });
    } else {
      const users = await prisma.user.findMany({ select: { id: true } });
      result = await notificationService.createBulkSystemNotifications({
        userIds: users.map((u) => u.id),
        title,
        message,
      });
    }

    return sendSuccess(res, 201, 'System notification sent successfully.', {
      count: result.length,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  deleteAllRead,
  getUnreadCount,
  broadcastSystemNotification,
};
