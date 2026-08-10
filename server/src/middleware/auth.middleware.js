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

const setAuthCookies = (res, accessToken, refreshToken, persistent) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: persistent ? 30 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000,
  });
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isEmailVerified: true,
  image: true,
  bio: true,
  createdAt: true,
  updatedAt: true,
};

const tryRefreshSession = async (req, res) => {
  const rt = req.cookies.refreshToken;
  if (!rt) return null;

  let rtDecoded;
  try {
    rtDecoded = verifyRefreshToken(rt);
  } catch {
    return null;
  }

  const hashed = hashToken(rt);
  const session = await prisma.session.findUnique({
    where: { token: hashed },
  });

  if (!session || session.expiresAt < new Date()) return null;

  const user = await prisma.user.findUnique({
    where: { id: rtDecoded.id },
    select: userSelect,
  });

  if (!user) return null;

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
        persistent: session.persistent,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    }),
  ]);

  setAuthCookies(res, newAT, newRT, session.persistent);
  return user;
};

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      const user = await tryRefreshSession(req, res);
      if (user) {
        req.user = user;
        return next();
      }
      return sendError(res, 401, 'No token provided. Please log in.');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        const user = await tryRefreshSession(req, res);
        if (user) {
          req.user = user;
          return next();
        }
        return sendError(res, 401, 'Session expired. Please log in again.');
      }

      if (err.name === 'JsonWebTokenError') {
        return sendError(res, 401, 'Invalid token. Please log in again.');
      }

      return next(err);
    }

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

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: userSelect,
    });

    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

module.exports = { protect, restrictTo, verifiedOnly, optionalAuth };
