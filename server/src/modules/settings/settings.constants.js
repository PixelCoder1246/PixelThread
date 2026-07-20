const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
const URL_REGEX = /^https?:\/\/.+/i;
const BIO_MAX_LENGTH = 500;
const WEBSITE_MAX_LENGTH = 500;
const SOCIAL_LINK_MAX_LENGTH = 500;
const MAX_SOCIAL_LINKS = 20;

const ALLOWED_LANGUAGES = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ru',
  'ja',
  'ko',
  'zh',
  'ar',
  'hi',
  'bn',
  'ur',
  'tr',
  'nl',
  'pl',
  'sv',
  'da',
  'fi',
  'no',
  'cs',
  'hu',
  'ro',
  'uk',
  'el',
  'he',
  'th',
  'vi',
  'id',
];

const ALLOWED_THEMES = ['light', 'dark', 'system'];

const ALLOWED_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Africa/Cairo',
  'Africa/Lagos',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'America/Mexico_City',
  'America/Toronto',
  'America/Vancouver',
];

const NOTIFICATION_TOGGLES = {
  LIKES: 'likes',
  COMMENTS: 'comments',
  REPLIES: 'replies',
  FOLLOWS: 'follows',
  MENTIONS: 'mentions',
  SYSTEM_ANNOUNCEMENTS: 'systemAnnouncements',
};

const DEFAULT_NOTIFICATION_PREFERENCES = {
  [NOTIFICATION_TOGGLES.LIKES]: true,
  [NOTIFICATION_TOGGLES.COMMENTS]: true,
  [NOTIFICATION_TOGGLES.REPLIES]: true,
  [NOTIFICATION_TOGGLES.FOLLOWS]: true,
  [NOTIFICATION_TOGGLES.MENTIONS]: true,
  [NOTIFICATION_TOGGLES.SYSTEM_ANNOUNCEMENTS]: true,
};

const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,128}$/;

module.exports = {
  USERNAME_REGEX,
  URL_REGEX,
  BIO_MAX_LENGTH,
  WEBSITE_MAX_LENGTH,
  SOCIAL_LINK_MAX_LENGTH,
  MAX_SOCIAL_LINKS,
  ALLOWED_LANGUAGES,
  ALLOWED_THEMES,
  ALLOWED_TIMEZONES,
  NOTIFICATION_TOGGLES,
  DEFAULT_NOTIFICATION_PREFERENCES,
  IMAGE_MAX_SIZE,
  IMAGE_ALLOWED_TYPES,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_REGEX,
};
