import { TransformableInfo } from 'logform';
import winston, { createLogger } from 'winston';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: TransformableInfo) =>
      `${new Date().toUTCString()} ${info.level}: ${info.message}`
  )
);

const logger = createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info'
    })
  ],
  format
});

export default logger;
