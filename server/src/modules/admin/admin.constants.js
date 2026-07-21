const ADMIN_ROLES = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  MODERATOR: 'MODERATOR',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
};

const ADMIN_ROLE_VALUES = Object.values(ADMIN_ROLES);

const AUDIT_ACTIONS = {
  BAN_USER: 'BAN_USER',
  UNBAN_USER: 'UNBAN_USER',
  VERIFY_USER: 'VERIFY_USER',
  CHANGE_ROLE: 'CHANGE_ROLE',
  DELETE_POST: 'DELETE_POST',
  ARCHIVE_POST: 'ARCHIVE_POST',
  RESTORE_POST: 'RESTORE_POST',
  FEATURE_POST: 'FEATURE_POST',
  UNFEATURE_POST: 'UNFEATURE_POST',
  PIN_POST: 'PIN_POST',
  UNPIN_POST: 'UNPIN_POST',
  DELETE_COMMENT: 'DELETE_COMMENT',
  HIDE_COMMENT: 'HIDE_COMMENT',
  APPROVE_COMMENT: 'APPROVE_COMMENT',
  DELETE_MEDIA: 'DELETE_MEDIA',
  CREATE_ANNOUNCEMENT: 'CREATE_ANNOUNCEMENT',
  DELETE_ANNOUNCEMENT: 'DELETE_ANNOUNCEMENT',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESOLVE_REPORT: 'RESOLVE_REPORT',
  REJECT_REPORT: 'REJECT_REPORT',
};

const AUDIT_ACTION_VALUES = Object.values(AUDIT_ACTIONS);

const AUDIT_TARGETS = {
  USER: 'USER',
  POST: 'POST',
  COMMENT: 'COMMENT',
  MEDIA: 'MEDIA',
  REPORT: 'REPORT',
  SETTING: 'SETTING',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
};

const AUDIT_TARGET_VALUES = Object.values(AUDIT_TARGETS);

const ANNOUNCEMENT_TYPES = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ALERT: 'ALERT',
  MAINTENANCE: 'MAINTENANCE',
};

const ANNOUNCEMENT_TYPE_VALUES = Object.values(ANNOUNCEMENT_TYPES);

const SETTING_KEYS = {
  MAINTENANCE_MODE: 'maintenance_mode',
  REGISTRATION_ENABLED: 'registration_enabled',
  AI_ENABLED: 'ai_enabled',
  UPLOADS_ENABLED: 'uploads_enabled',
  COMMENTS_ENABLED: 'comments_enabled',
};

const SETTING_KEY_VALUES = Object.values(SETTING_KEYS);

const DEFAULT_SETTINGS = {
  maintenance_mode: {
    value: 'false',
    type: 'boolean',
    description: 'Enable maintenance mode',
  },
  registration_enabled: {
    value: 'true',
    type: 'boolean',
    description: 'Allow new user registrations',
  },
  ai_enabled: {
    value: 'true',
    type: 'boolean',
    description: 'Enable AI features',
  },
  uploads_enabled: {
    value: 'true',
    type: 'boolean',
    description: 'Enable file uploads',
  },
  comments_enabled: {
    value: 'true',
    type: 'boolean',
    description: 'Enable comments on posts',
  },
};

const SORT_OPTIONS = [
  'newest',
  'oldest',
  'mostViewed',
  'mostLiked',
  'mostCommented',
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

module.exports = {
  ADMIN_ROLES,
  ADMIN_ROLE_VALUES,
  AUDIT_ACTIONS,
  AUDIT_ACTION_VALUES,
  AUDIT_TARGETS,
  AUDIT_TARGET_VALUES,
  ANNOUNCEMENT_TYPES,
  ANNOUNCEMENT_TYPE_VALUES,
  SETTING_KEYS,
  SETTING_KEY_VALUES,
  DEFAULT_SETTINGS,
  SORT_OPTIONS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
