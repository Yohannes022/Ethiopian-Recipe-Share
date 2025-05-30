import winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { Console, File } from 'winston/lib/winston/transports';
import DailyRotateFile from 'winston-daily-rotate-file';
import { format } from 'winston';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log levels and their colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? winston.format.json() : winston.format.simple(),
    winston.format.align()
  ),
  transports: [
    // Console transport
    new Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.simple()
      ),
    }),
    // Daily rotate file transport for all logs
    new DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Error logs
    new File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    })
  ],
  exceptionHandlers: [
    new File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
});

// Add colors for different log levels
logger.addColors(logColors);

export default logger;

// Create a stream for morgan to pipe logs to winston
if (process.env.NODE_ENV !== 'test') {
  logger.stream = {
    write: (message: string) => {
      logger.info(message.trim());
    },
  } as any;
}
