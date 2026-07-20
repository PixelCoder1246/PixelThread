const { sendError } = require('../utils/ApiResponse');
const logger = require('../config/logger');

const isMulterError = (err) => {
  return (
    err.name === 'MulterError' ||
    err.code === 'LIMIT_FILE_SIZE' ||
    err.code === 'LIMIT_UNEXPECTED_FILE'
  );
};

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(null, 400, 'File size exceeds the maximum limit (10MB).');
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return sendError(null, 400, 'Too many files uploaded. Maximum is 10.');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendError(null, 400, 'Unexpected file field.');
  }
  return sendError(null, 400, err.message);
};

const errorHandler = (err, req, res, next) => {
  if (!err) return next();

  if (isMulterError(err) || err.name === 'MulterError') {
    const result = handleMulterError(err);
    if (result) return res ? result : null;
  }

  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return sendError(res, 409, `A record with this ${field} already exists.`);
  }

  if (err.code === 'P2025') {
    return sendError(res, 404, 'Resource not found.');
  }

  if (err.code === 'P2003') {
    return sendError(res, 400, 'Referenced resource does not exist.');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token has expired. Please log in again.');
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token. Please log in again.');
  }

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Invalid JSON in request body.');
  }

  if (err.type === 'entity.too.large') {
    return sendError(res, 413, 'Request entity too large.');
  }

  logger.error('UNHANDLED ERROR', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    method: req?.method,
    path: req?.originalUrl,
    ip: req?.ip,
  });

  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong. Please try again later.';

  return sendError(res, 500, message);
};

module.exports = errorHandler;
