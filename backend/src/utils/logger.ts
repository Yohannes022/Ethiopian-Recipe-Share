import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, align, json } = winston.format;

// Log directory
const logDir = 'logs';

// Define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Define different colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? json() : winston.format.simple(),
    align()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        logFormat
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
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
  // Exit on error, set to false to allow the application to continue
  exitOnError: false,
});

// Create a stream for morgan to pipe logs to winston
if (process.env.NODE_ENV !== 'test') {
  logger.stream = {
    write: (message: string) => {
      logger.info(message.trim());
    },
  } as any;
}

export default logger;
