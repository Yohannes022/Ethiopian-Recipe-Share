const AppError = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Set default values for status code and message
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;
  
  // Log the error for debugging
  logger.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${error.message}`);
  logger.error(error.stack);
  
  // Handle specific error types
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new AppError(message, 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${value}. Please use another value.`;
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = AppError.validationError(messages);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = AppError.unauthorized('Invalid token. Please log in again!');
  }
  
  if (err.name === 'TokenExpiredError') {
    error = AppError.unauthorized('Your token has expired. Please log in again!');
  }
  
  // Rate limiter errors
  if (err.statusCode === 429) {
    error = AppError.tooManyRequests('Too many requests, please try again later');
  }
  
  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      status: error.status || 'error',
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};

module.exports = errorHandler;
