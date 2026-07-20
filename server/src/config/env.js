const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const logger = require('./logger');

const required = {
  DATABASE_URL: 'Database connection string',
  JWT_ACCESS_SECRET: 'JWT access token signing secret',
  JWT_REFRESH_SECRET: 'JWT refresh token signing secret',
  CLIENT_URL: 'Frontend URL for CORS and email links',
};

const conditionallyRequired = {
  NVIDIA_API_KEY: 'NVIDIA NIM API key (required if AI module is used)',
  EMAIL_HOST: 'SMTP host (required if email features are used)',
  EMAIL_USER: 'SMTP username (required if email features are used)',
  EMAIL_PASS: 'SMTP password (required if email features are used)',
};

const defaults = {
  PORT: '5000',
  NODE_ENV: 'development',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  LOG_LEVEL: 'debug',
  API_URL: 'http://localhost:5000',
  STORAGE_PROVIDER: 'local',
};

const validate = () => {
  const missing = [];

  for (const [key, desc] of Object.entries(required)) {
    if (!process.env[key]) {
      missing.push(`${key} — ${desc}`);
    }
  }

  if (missing.length > 0) {
    logger.error('Missing required environment variables:');
    missing.forEach((m) => logger.error(`  ${m}`));
    process.exit(1);
  }

  for (const [key, desc] of Object.entries(conditionallyRequired)) {
    if (!process.env[key]) {
      logger.warn(`Optional env var not set: ${key} — ${desc}`);
    }
  }

  for (const [key, val] of Object.entries(defaults)) {
    if (!process.env[key]) {
      process.env[key] = val;
      logger.debug(`Set default for ${key}: ${val}`);
    }
  }

  const nodeEnv = process.env.NODE_ENV;
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    logger.warn(
      `NODE_ENV="${nodeEnv}" is not standard. Use development/production/test.`
    );
  }

  const jwtAccess = process.env.JWT_ACCESS_EXPIRES_IN;
  const jwtRefresh = process.env.JWT_REFRESH_EXPIRES_IN;
  const accessMatch = jwtAccess.match(/^(\d+)([smhd])$/);
  const refreshMatch = jwtRefresh.match(/^(\d+)([smhd])$/);
  if (!accessMatch)
    logger.warn(
      `JWT_ACCESS_EXPIRES_IN="${jwtAccess}" may be invalid (expected format: 15m, 1h, 7d)`
    );
  if (!refreshMatch)
    logger.warn(
      `JWT_REFRESH_EXPIRES_IN="${jwtRefresh}" may be invalid (expected format: 15m, 1h, 7d)`
    );

  if (
    process.env.STORAGE_PROVIDER &&
    !['local', 's3', 'cloudinary', 'supabase'].includes(
      process.env.STORAGE_PROVIDER
    )
  ) {
    logger.warn(
      `STORAGE_PROVIDER="${process.env.STORAGE_PROVIDER}" is not recognized. Use local/s3/cloudinary/supabase.`
    );
  }

  logger.info('Environment validation passed');
  return true;
};

module.exports = { validate };
