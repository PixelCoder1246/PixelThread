const crypto = require('crypto');
const { sendError } = require('../utils/ApiResponse');
const {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/jwt');
const prisma = require('../config/db');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isEmailVerified: true,
  image: true,
  createdAt: true,
};

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return sendError(res, 401, 'No token provided. Please log in.');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Attempt silent refresh
        const rt = req.cookies.refreshToken;
        if (!rt) {
          return sendError(res, 401, 'Session expired. Please log in again.');
        }

        try {
          const rtDecoded = verifyRefreshToken(rt);
          const hashed = hashToken(rt);
          const session = await prisma.session.findUnique({
            where: { token: hashed },
          });

          if (!session || session.expiresAt < new Date()) {
            return sendError(res, 401, 'Session expired. Please log in again.');
          }

          const user = await prisma.user.findUnique({
            where: { id: rtDecoded.id },
            select: userSelect,
          });

          if (!user) {
            return sendError(
              res,
              401,
              'User no longer exists. Please log in again.'
            );
          }

          const newAT = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
          });
          const newRT = generateRefreshToken({ id: user.id });

          await prisma.$transaction([
            prisma.session.delete({ where: { id: session.id } }),
            prisma.session.create({
              data: {
                userId: user.id,
                token: hashToken(newRT),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
              },
            }),
          ]);

          setAuthCookies(res, newAT, newRT);
          req.user = user;
          return next();
        } catch {
          return sendError(res, 401, 'Session expired. Please log in again.');
        }
      }

      if (err.name === 'JsonWebTokenError') {
        return sendError(res, 401, 'Invalid token. Please log in again.');
      }

      return next(err);
    }

    // Access token was valid — normal path
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: userSelect,
    });

    if (!user) {
      return sendError(res, 401, 'User no longer exists. Please log in again.');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const verifiedOnly = (req, res, next) => {
  if (!req.user || !req.user.isEmailVerified) {
    return sendError(
      res,
      403,
      'Please verify your email before accessing this feature.'
    );
  }
  next();
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        'You do not have permission to perform this action.'
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo, verifiedOnly };
