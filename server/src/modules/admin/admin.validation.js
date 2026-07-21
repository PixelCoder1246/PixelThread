const ApiError = require('../../utils/ApiError');
const {
  AUDIT_ACTION_VALUES,
  AUDIT_TARGET_VALUES,
  ANNOUNCEMENT_TYPE_VALUES,
  SETTING_KEY_VALUES,
  SORT_OPTIONS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} = require('./admin.constants');

const validatePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT)
  );
  return { page, limit };
};

const validateId = (params) => {
  const { id } = params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new ApiError(400, 'Invalid ID parameter.');
  }
  return id.trim();
};

const validateBanBody = (body) => {
  const reason = body.reason;
  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    throw new ApiError(400, 'Ban reason is required.');
  }
  if (reason.trim().length > 500) {
    throw new ApiError(400, 'Ban reason must not exceed 500 characters.');
  }
  return { reason: reason.trim() };
};

const validateRoleBody = (body) => {
  const { role } = body;
  if (!role || typeof role !== 'string') {
    throw new ApiError(400, 'Role is required.');
  }
  const validRoles = ['USER', 'ADMIN'];
  if (!validRoles.includes(role)) {
    throw new ApiError(
      400,
      `Invalid role. Must be one of: ${validRoles.join(', ')}`
    );
  }
  return { role };
};

const validateUserFilters = (query) => {
  const filters = {};
  if (query.verified === 'true') filters.isEmailVerified = true;
  if (query.verified === 'false') filters.isEmailVerified = false;
  if (query.banned === 'true') filters.isActive = false;
  if (query.banned === 'false') filters.isActive = true;
  if (query.role && ['USER', 'ADMIN'].includes(query.role.toUpperCase())) {
    filters.role = query.role.toUpperCase();
  }
  if (query.active === 'true') filters.isActive = true;
  if (query.active === 'false') filters.isActive = false;
  if (query.search && typeof query.search === 'string') {
    filters.search = query.search.trim();
  }
  return filters;
};

const validatePostFilters = (query) => {
  const filters = {};
  if (
    query.status &&
    ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(query.status.toUpperCase())
  ) {
    filters.status = query.status.toUpperCase();
  }
  if (
    query.visibility &&
    ['PUBLIC', 'PRIVATE'].includes(query.visibility.toUpperCase())
  ) {
    filters.visibility = query.visibility.toUpperCase();
  }
  if (query.authorId && typeof query.authorId === 'string') {
    filters.authorId = query.authorId.trim();
  }
  if (query.tag && typeof query.tag === 'string') {
    filters.tag = query.tag.trim().toLowerCase();
  }
  if (query.search && typeof query.search === 'string') {
    filters.search = query.search.trim();
  }
  if (query.featured === 'true') filters.featured = true;
  if (query.featured === 'false') filters.featured = false;
  if (query.pinned === 'true') filters.pinned = true;
  if (query.pinned === 'false') filters.pinned = false;
  return filters;
};

const validateCommentFilters = (query) => {
  const filters = {};
  if (query.postId && typeof query.postId === 'string') {
    filters.postId = query.postId.trim();
  }
  if (query.userId && typeof query.userId === 'string') {
    filters.userId = query.userId.trim();
  }
  if (query.hidden === 'true') filters.isHidden = true;
  if (query.hidden === 'false') filters.isHidden = false;
  if (query.search && typeof query.search === 'string') {
    filters.search = query.search.trim();
  }
  return filters;
};

const validateMediaFilters = (query) => {
  const filters = {};
  if (query.ownerId && typeof query.ownerId === 'string') {
    filters.ownerId = query.ownerId.trim();
  }
  if (query.mimeType && typeof query.mimeType === 'string') {
    filters.mimeType = query.mimeType.trim();
  }
  if (query.type && typeof query.type === 'string') {
    filters.type = query.type.trim().toLowerCase();
  }
  if (query.search && typeof query.search === 'string') {
    filters.search = query.search.trim();
  }
  if (query.dateFrom) filters.dateFrom = query.dateFrom;
  if (query.dateTo) filters.dateTo = query.dateTo;
  return filters;
};

const validateAnnouncementBody = (body) => {
  const { title, message, type, expiresAt } = body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new ApiError(400, 'Announcement title is required.');
  }
  if (title.trim().length > 200) {
    throw new ApiError(
      400,
      'Announcement title must not exceed 200 characters.'
    );
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new ApiError(400, 'Announcement message is required.');
  }
  if (message.trim().length > 5000) {
    throw new ApiError(
      400,
      'Announcement message must not exceed 5000 characters.'
    );
  }
  const validType =
    type && ANNOUNCEMENT_TYPE_VALUES.includes(type.toUpperCase())
      ? type.toUpperCase()
      : 'INFO';
  let parsedExpiresAt = null;
  if (expiresAt) {
    const parsed = new Date(expiresAt);
    if (isNaN(parsed.getTime())) {
      throw new ApiError(400, 'Invalid expiration date.');
    }
    if (parsed <= new Date()) {
      throw new ApiError(400, 'Expiration date must be in the future.');
    }
    parsedExpiresAt = parsed;
  }
  return {
    title: title.trim(),
    message: message.trim(),
    type: validType,
    expiresAt: parsedExpiresAt,
  };
};

const validateSettingsBody = (body) => {
  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    throw new ApiError(400, 'At least one setting is required.');
  }
  const validKeys = SETTING_KEY_VALUES;
  const settings = {};
  for (const key of Object.keys(body)) {
    if (!validKeys.includes(key)) {
      throw new ApiError(400, `Invalid setting key: ${key}`);
    }
    const val = body[key];
    if (typeof val !== 'string' || (val !== 'true' && val !== 'false')) {
      throw new ApiError(400, `Setting ${key} must be "true" or "false".`);
    }
    settings[key] = val;
  }
  return settings;
};

const validateAdminSearch = (query) => {
  const q = query.q;
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    throw new ApiError(400, 'Search query is required.');
  }
  const type = query.type || 'all';
  const validTypes = ['all', 'users', 'posts', 'reports', 'media'];
  if (!validTypes.includes(type)) {
    throw new ApiError(
      400,
      `Invalid search type. Must be one of: ${validTypes.join(', ')}`
    );
  }
  return { q: q.trim(), type };
};

const validateAuditLogFilters = (query) => {
  const filters = {};
  if (
    query.action &&
    AUDIT_ACTION_VALUES.includes(query.action.toUpperCase())
  ) {
    filters.action = query.action.toUpperCase();
  }
  if (
    query.targetType &&
    AUDIT_TARGET_VALUES.includes(query.targetType.toUpperCase())
  ) {
    filters.targetType = query.targetType.toUpperCase();
  }
  if (query.adminId && typeof query.adminId === 'string') {
    filters.adminId = query.adminId.trim();
  }
  if (query.targetId && typeof query.targetId === 'string') {
    filters.targetId = query.targetId.trim();
  }
  return filters;
};

const validateSort = (query) => {
  if (query.sort && SORT_OPTIONS.includes(query.sort)) {
    return query.sort;
  }
  return 'newest';
};

module.exports = {
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
};
