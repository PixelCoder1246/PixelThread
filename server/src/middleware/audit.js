const logger = require('../config/logger');

const auditLog = (action, details) => {
  logger.info(`AUDIT: ${action}`, details);
};

const auditMiddleware = (action) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      const statusCode = res.statusCode;
      if (statusCode >= 400) {
        auditLog(action, {
          userId: req.user?.id,
          method: req.method,
          path: req.originalUrl,
          statusCode,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }
      return originalJson(body);
    };
    next();
  };
};

module.exports = { auditLog, auditMiddleware };
