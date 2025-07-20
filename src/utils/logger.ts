import pino from 'pino';
import config from '../config/config';

const logger = pino({
  level: config.env === 'development' ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export default logger;
