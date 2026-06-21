const { sendError } = require('../utils/ApiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Operational / known errors thrown as ApiError
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return sendError(res, 409, `A record with this ${field} already exists.`);
  }

  // JWT errors (should normally be caught in auth middleware, safety net here)
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token has expired. Please log in again.');
  }
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token. Please log in again.');
  }

  // Unknown / programming errors — don't leak details in production
  console.error('UNHANDLED ERROR:', err);
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong. Please try again later.';

  return sendError(res, 500, message);
};

module.exports = errorHandler;
