const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { validate } = require('./src/config/env');
const logger = require('./src/config/logger');
const prisma = require('./src/config/db');

validate();

const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server started`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    apiUrl: `http://localhost:${PORT}`,
  });
});

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received: starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    } catch (err) {
      logger.error('Error disconnecting database', { error: err.message });
    }

    logger.info('Graceful shutdown complete');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack,
  });
  gracefulShutdown('uncaughtException');
});
