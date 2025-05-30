import winston, { format, transports } from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import 'winston-daily-rotate-file';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log levels and their colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

// Create the logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'ethiopian-recipe-share' },
  transports: [
    // Console transport
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    // Daily rotate file transport for all logs
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Error logs
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    })
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
});

// Add colors to winston
winston.addColors(logColors);

// Create a stream for morgan to pipe logs to winston
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
