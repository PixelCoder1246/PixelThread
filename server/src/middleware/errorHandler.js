const { sendError } = require('../utils/ApiResponse');

const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return sendError(res, 409, `A record with this ${field} already exists.`);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token has expired. Please log in again.');
  }
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token. Please log in again.');
  }

  console.error('UNHANDLED ERROR:', err);
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong. Please try again later.';

  return sendError(res, 500, message);
};

module.exports = errorHandler;
