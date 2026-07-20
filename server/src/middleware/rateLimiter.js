const rateLimit = require('express-rate-limit');

const createLimiter = (opts = {}) => {
  return rateLimit({
    windowMs: opts.windowMs || 60 * 1000,
    max: opts.max || 10,
    message: {
      success: false,
      message: opts.message || 'Too many requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
    ...opts,
  });
};

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    'Too many authentication attempts. Please try again after 15 minutes.',
});

const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message:
    'Too many registration attempts from this IP. Please try again later.',
});

const uploadLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many upload requests. Please slow down.',
});

module.exports = {
  createLimiter,
  authLimiter,
  registerLimiter,
  uploadLimiter,
};
