const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const levelFromEnv = () => {
  const env =
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  return levels[env] !== undefined ? env : 'info';
};

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const base = { timestamp, level, message };
  if (meta && Object.keys(meta).length > 0) {
    Object.assign(base, meta);
  }
  if (process.env.NODE_ENV === 'development') {
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const metaStr =
      meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${prefix} ${message}${metaStr}`;
  }
  return JSON.stringify(base);
};

const shouldLog = (level) => levels[level] <= levels[levelFromEnv()];

const logger = {
  error: (message, meta) => {
    if (shouldLog('error'))
      console.error(formatMessage('error', message, meta));
  },
  warn: (message, meta) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, meta));
  },
  info: (message, meta) => {
    if (shouldLog('info')) console.log(formatMessage('info', message, meta));
  },
  debug: (message, meta) => {
    if (shouldLog('debug')) console.log(formatMessage('debug', message, meta));
  },
};

module.exports = logger;
