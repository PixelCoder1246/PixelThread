const { sendError } = require('../utils/ApiResponse');
const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return sendError(res, 401, 'No token provided. Please log in.');
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError(res, 401, 'User no longer exists. Please log in again.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Access token expired. Please refresh your token.');
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token. Please log in again.');
    }
    next(err);
  }
};

const verifiedOnly = (req, res, next) => {
  if (!req.user || !req.user.isEmailVerified) {
    return sendError(res, 403, 'Please verify your email before accessing this feature.');
  }
  next();
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to perform this action.');
    }
    next();
  };
};

module.exports = { protect, restrictTo, verifiedOnly };
