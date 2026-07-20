const { sendError } = require('../utils/ApiResponse');

const ALLOWED_TAGS = [
  'b',
  'i',
  'em',
  'strong',
  'a',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'pre',
  'code',
  'span',
  'div',
  'img',
  'figure',
  'figcaption',
  'hr',
  'sub',
  'sup',
];

const stripXSS = (value) => {
  if (typeof value !== 'string') return value;

  let sanitized = value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=\w+/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    .replace(/vbscript\s*:/gi, '');

  return sanitized;
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = stripXSS(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = stripXSS(req.query[key]);
      }
    }
  }
  if (req.params) {
    for (const key of Object.keys(req.params)) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = stripXSS(req.params[key]);
      }
    }
  }
  next();
};

const validatePagination = (req, res, next) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  req.query.page = page;
  req.query.limit = limit;
  next();
};

module.exports = {
  sanitizeInput,
  stripXSS,
  sanitizeObject,
  validatePagination,
  ALLOWED_TAGS,
};
