const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_UPLOAD_LIMIT = 10;

const ALLOWED_SORT_OPTIONS = ['newest', 'oldest'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

module.exports = {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  DEFAULT_UPLOAD_LIMIT,
  ALLOWED_SORT_OPTIONS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
