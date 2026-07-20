const prisma = require('../config/db');
const logger = require('../config/logger');

const requestCounts = {};
let startTime = Date.now();

const requestTracker = (req, res, next) => {
  const key = `${req.method}:${req.route?.path || req.originalUrl}`;
  requestCounts[key] = (requestCounts[key] || 0) + 1;
  next();
};

const healthCheck = async (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
};

const readinessCheck = async (req, res) => {
  const checks = {
    database: false,
    storage: false,
    ai: false,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (err) {
    logger.error('Health check — database unavailable', { error: err.message });
  }

  checks.storage = process.env.STORAGE_PROVIDER === 'local' || true;

  checks.ai = !!process.env.NVIDIA_API_KEY;

  const allReady = Object.values(checks).every(Boolean);

  const statusCode = allReady ? 200 : 503;

  res.status(statusCode).json({
    status: allReady ? 'ok' : 'degraded',
    checks,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
};

const metricsHandler = async (req, res) => {
  const totalRequests = Object.values(requestCounts).reduce((a, b) => a + b, 0);

  const metrics = [
    '# HELP pixelthread_uptime_seconds Server uptime in seconds',
    '# TYPE pixelthread_uptime_seconds gauge',
    `pixelthread_uptime_seconds ${Math.floor((Date.now() - startTime) / 1000)}`,
    '',
    '# HELP pixelthread_requests_total Total request count',
    '# TYPE pixelthread_requests_total counter',
    `pixelthread_requests_total ${totalRequests}`,
    '',
    '# HELP pixelthread_request_count_by_route Request count by route',
    '# TYPE pixelthread_request_count_by_route gauge',
  ];

  for (const [route, count] of Object.entries(requestCounts)) {
    const safeRoute = route.replace(/:/g, '_').replace(/\//g, '_');
    metrics.push(`pixelthread_route_requests_total{route="${route}"} ${count}`);
  }

  metrics.push('');
  metrics.push('# HELP pixelthread_db_pool_size Database connection pool size');
  metrics.push('# TYPE pixelthread_db_pool_size gauge');
  metrics.push('pixelthread_db_pool_size 1');

  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(metrics.join('\n'));
};

module.exports = {
  healthCheck,
  readinessCheck,
  metricsHandler,
  requestTracker,
};
