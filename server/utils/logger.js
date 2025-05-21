const winston = require('winston');
const path = require('path');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;
const config = require('../config/config');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  const logMessage = stack || message;
  return `${timestamp} [${level}]: ${logMessage}`;
});

// Custom format for file output
const fileFormat = printf(({ level, message, timestamp, ...meta }) => {
  let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  
  // Add metadata if it exists
  if (Object.keys(meta).length > 0) {
    logMessage += ` \n${JSON.stringify(meta, null, 2)}`;
  }
  
  return logMessage;
});

// Define different log formats
const formats = {
  console: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    consoleFormat
  ),
  file: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    json(),
    fileFormat
  ),
};

// Create the logger instance
const logger = createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: formats.file,
  defaultMeta: { service: 'ethiopian-recipe-api' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level `info` and below to `combined.log`
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// If we're not in production, log to the console as well
if (config.env !== 'production') {
  logger.add(
    new transports.Console({
      format: formats.console,
      handleExceptions: true,
    })
  );
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection at: ${reason.stack || reason}`);
  // Recommended: send to a crash reporting service
  // process.exit(1); // Exit with failure
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.stack || error}`);
  // Recommended: send to a crash reporting service
  // process.exit(1); // Exit with failure
});

// Add a stream for morgan logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
