const logger = require('./logger');
const config = require('../config/config');

/**
 * Custom Error class for API errors
 * @extends Error
 */
class AppError extends Error {
  /**
   * Create AppError
   * @param {string|Array} message - Error message or array of error messages
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code (e.g., 'VALIDATION_ERROR', 'UNAUTHORIZED')
   * @param {Object} details - Additional error details
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = {}) {
    super(Array.isArray(message) ? message.join('; ') : message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
    
    // Log the error
    this.logError();
  }
  
  /**
   * Log the error with appropriate level
   */
  logError() {
    const errorInfo = {
      statusCode: this.statusCode,
      code: this.code,
      stack: this.stack,
      details: this.details,
    };
    
    if (this.statusCode >= 500) {
      logger.error(this.message, errorInfo);
    } else if (this.statusCode >= 400) {
      logger.warn(this.message, errorInfo);
    } else {
      logger.info(this.message, errorInfo);
    }
  }
  
  /**
   * Convert error to JSON for API response
   * @returns {Object} Error response object
   */
  toJSON() {
    const response = {
      status: this.status,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
    };
    
    // Include stack trace in development
    if (config.env === 'development') {
      response.stack = this.stack;
      response.details = this.details;
    }
    
    return response;
  }
  
  /**
   * Create a validation error
   * @param {Array} errors - Array of validation errors
   * @returns {AppError} Validation error instance
   */
  static validationError(errors) {
    return new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      { errors }
    );
  }
  
  /**
   * Create a not found error
   * @param {string} resource - Name of the resource that was not found
   * @returns {AppError} Not found error instance
   */
  static notFound(resource = 'Resource') {
    return new AppError(
      `${resource} not found`,
      404,
      'NOT_FOUND'
    );
  }
  
  /**
   * Create an unauthorized error
   * @param {string} message - Optional custom message
   * @returns {AppError} Unauthorized error instance
   */
  static unauthorized(message = 'Not authorized to access this route') {
    return new AppError(
      message,
      401,
      'UNAUTHORIZED'
    );
  }
  
  /**
   * Create a forbidden error
   * @param {string} message - Optional custom message
   * @returns {AppError} Forbidden error instance
   */
  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError(
      message,
      403,
      'FORBIDDEN'
    );
  }
  
  /**
   * Create a bad request error
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} details - Additional details
   * @returns {AppError} Bad request error instance
   */
  static badRequest(message = 'Bad request', code = 'BAD_REQUEST', details = {}) {
    return new AppError(
      message,
      400,
      code,
      details
    );
  }
  
  /**
   * Create a conflict error
   * @param {string} message - Error message
   * @returns {AppError} Conflict error instance
   */
  static conflict(message = 'Resource already exists') {
    return new AppError(
      message,
      409,
      'CONFLICT'
    );
  }
  
  /**
   * Create a rate limit exceeded error
   * @param {string} message - Error message
   * @returns {AppError} Rate limit exceeded error instance
   */
  static tooManyRequests(message = 'Too many requests, please try again later') {
    return new AppError(
      message,
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }
}

module.exports = AppError;
