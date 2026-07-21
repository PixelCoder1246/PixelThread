const { sendSuccess } = require('../../utils/ApiResponse');
const adminService = require('./admin.service');
const {
  validatePagination,
  validateId,
  validateBanBody,
  validateRoleBody,
  validateUserFilters,
  validatePostFilters,
  validateCommentFilters,
  validateMediaFilters,
  validateAnnouncementBody,
  validateSettingsBody,
  validateAdminSearch,
  validateAuditLogFilters,
  validateSort,
} = require('./admin.validation');
const { formatPaginatedResponse } = require('./admin.utils');

const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboard();
    sendSuccess(res, 200, 'Dashboard data fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const filters = validateUserFilters(req.query);
    const sort = validateSort(req.query);
    const { items, totalItems } = await adminService.getUsers(
      filters,
      sort,
      page,
      limit
    );
    sendSuccess(
      res,
      200,
      'Users fetched successfully.',
      formatPaginatedResponse(items, totalItems, page, limit)
    );
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.getUser(id);
    sendSuccess(res, 200, 'User fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const { role } = validateRoleBody(req.body);
    const data = await adminService.updateUserRole(id, req.user.id, role);
    sendSuccess(res, 200, `User role updated to ${role}.`, data);
  } catch (err) {
    next(err);
  }
};

const banUser = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const { reason } = validateBanBody(req.body);
    const data = await adminService.banUser(id, req.user.id, reason);
    sendSuccess(res, 200, 'User has been banned.', data);
  } catch (err) {
    next(err);
  }
};

const unbanUser = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.unbanUser(id, req.user.id);
    sendSuccess(res, 200, 'User has been unbanned.', data);
  } catch (err) {
    next(err);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.verifyUser(id, req.user.id);
    sendSuccess(res, 200, 'User has been verified.', data);
  } catch (err) {
    next(err);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const filters = validatePostFilters(req.query);
    const sort = validateSort(req.query);
    const { items, totalItems } = await adminService.getPosts(
      filters,
      sort,
      page,
      limit
    );
    sendSuccess(
      res,
      200,
      'Posts fetched successfully.',
      formatPaginatedResponse(items, totalItems, page, limit)
    );
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    await adminService.deletePost(id, req.user.id);
    sendSuccess(res, 200, 'Post deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const archivePost = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.archivePost(id, req.user.id);
    sendSuccess(res, 200, 'Post archived successfully.', data);
  } catch (err) {
    next(err);
  }
};

const restorePost = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.restorePost(id, req.user.id);
    sendSuccess(res, 200, 'Post restored successfully.', data);
  } catch (err) {
    next(err);
  }
};

const featurePost = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.featurePost(id, req.user.id);
    sendSuccess(res, 200, 'Post featured successfully.', data);
  } catch (err) {
    next(err);
  }
};

const unfeaturePost = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.unfeaturePost(id, req.user.id);
    sendSuccess(res, 200, 'Post unfeatured successfully.', data);
  } catch (err) {
    next(err);
  }
};

const pinPost = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.pinPost(id, req.user.id);
    sendSuccess(res, 200, 'Post pinned successfully.', data);
  } catch (err) {
    next(err);
  }
};

const unpinPost = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.unpinPost(id, req.user.id);
    sendSuccess(res, 200, 'Post unpinned successfully.', data);
  } catch (err) {
    next(err);
  }
};

const getComments = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const filters = validateCommentFilters(req.query);
    const sort = validateSort(req.query);
    const { items, totalItems } = await adminService.getComments(
      filters,
      sort,
      page,
      limit
    );
    sendSuccess(
      res,
      200,
      'Comments fetched successfully.',
      formatPaginatedResponse(items, totalItems, page, limit)
    );
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    await adminService.deleteComment(id, req.user.id);
    sendSuccess(res, 200, 'Comment deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const hideComment = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.hideComment(id, req.user.id);
    sendSuccess(res, 200, 'Comment hidden successfully.', data);
  } catch (err) {
    next(err);
  }
};

const approveComment = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    const data = await adminService.approveComment(id, req.user.id);
    sendSuccess(res, 200, 'Comment approved successfully.', data);
  } catch (err) {
    next(err);
  }
};

const getMediaList = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const filters = validateMediaFilters(req.query);
    const sort = validateSort(req.query);
    const { items, totalItems } = await adminService.getMediaList(
      filters,
      sort,
      page,
      limit
    );
    sendSuccess(
      res,
      200,
      'Media fetched successfully.',
      formatPaginatedResponse(items, totalItems, page, limit)
    );
  } catch (err) {
    next(err);
  }
};

const deleteMedia = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    await adminService.deleteMedia(id, req.user.id);
    sendSuccess(res, 200, 'Media deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const getOrphanedMedia = async (req, res, next) => {
  try {
    const data = await adminService.getOrphanedMedia();
    sendSuccess(res, 200, 'Orphaned media fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const deleteOrphanedMedia = async (req, res, next) => {
  try {
    const { limit } = validatePagination(req.query);
    const data = await adminService.getOrphanedMedia();

    const orphaned = data || [];
    const totalOrphaned = orphaned.length;

    const idsToDelete = orphaned.slice(0, limit).map((m) => m.id);
    for (const mediaId of idsToDelete) {
      await adminService.deleteMedia(mediaId, req.user.id);
    }

    sendSuccess(res, 200, 'Orphaned media deleted successfully.', {
      deleted: idsToDelete.length,
      remaining: Math.max(0, totalOrphaned - idsToDelete.length),
    });
  } catch (err) {
    next(err);
  }
};

const getEnhancedAnalytics = async (req, res, next) => {
  try {
    const data = await adminService.getEnhancedAnalytics();
    sendSuccess(res, 200, 'Analytics data fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const data = validateAnnouncementBody(req.body);
    const announcement = await adminService.createAnnouncement(
      data,
      req.user.id
    );
    sendSuccess(
      res,
      201,
      'Announcement created and notifications sent.',
      announcement
    );
  } catch (err) {
    next(err);
  }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const { items, totalItems } = await adminService.getAnnouncements(
      page,
      limit
    );
    sendSuccess(
      res,
      200,
      'Announcements fetched successfully.',
      formatPaginatedResponse(items, totalItems, page, limit)
    );
  } catch (err) {
    next(err);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const id = validateId(req.params);
    await adminService.deleteAnnouncement(id, req.user.id);
    sendSuccess(res, 200, 'Announcement deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const filters = validateAuditLogFilters(req.query);
    const { items, totalItems } = await adminService.getAuditLogs(
      filters,
      page,
      limit
    );
    sendSuccess(
      res,
      200,
      'Audit logs fetched successfully.',
      formatPaginatedResponse(items, totalItems, page, limit)
    );
  } catch (err) {
    next(err);
  }
};

const getAuditLogStats = async (req, res, next) => {
  try {
    const data = await adminService.getAuditLogStats();
    sendSuccess(res, 200, 'Audit log stats fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const adminSearch = async (req, res, next) => {
  try {
    const query = validateAdminSearch(req.query);
    const data = await adminService.adminSearch(query);
    sendSuccess(res, 200, 'Search results fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const getPlatformSettings = async (req, res, next) => {
  try {
    const data = await adminService.getPlatformSettings();
    sendSuccess(res, 200, 'Platform settings fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

const updatePlatformSettings = async (req, res, next) => {
  try {
    const settings = validateSettingsBody(req.body);
    const data = await adminService.updatePlatformSettings(
      settings,
      req.user.id
    );
    sendSuccess(res, 200, 'Platform settings updated successfully.', data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getUser,
  updateUserRole,
  banUser,
  unbanUser,
  verifyUser,
  getPosts,
  deletePost,
  archivePost,
  restorePost,
  featurePost,
  unfeaturePost,
  pinPost,
  unpinPost,
  getComments,
  deleteComment,
  hideComment,
  approveComment,
  getMediaList,
  deleteMedia,
  getOrphanedMedia,
  deleteOrphanedMedia,
  getEnhancedAnalytics,
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  getAuditLogs,
  getAuditLogStats,
  adminSearch,
  getPlatformSettings,
  updatePlatformSettings,
};
