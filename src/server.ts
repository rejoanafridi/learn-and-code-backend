import app from './app';
import config from './config/config';
import logger from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

process.on('unhandledRejection', (reason: Error | any) => {
  logger.warn(`Unhandled Rejection at: ${reason.stack || reason}`);
  // Recommended: send the information to sentry.io or similar
});

process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.stack}`);
  // Recommended: send the information to sentry.io or similar
  process.exit(1);
});

export default server;
