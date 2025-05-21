// Wrap async/await route handlers to handle errors
const AppError = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * Async handler to wrap around async route handlers
 * @param {Function} fn - The async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  // Log the request
  const start = Date.now();
  const { method, originalUrl, ip, user } = req;
  
  // Log request details
  logger.info(`[${new Date().toISOString()}] ${method} ${originalUrl} - IP: ${ip}${user ? ` - User: ${user._id}` : ''}`);
  
  // Handle the promise
  Promise.resolve(fn(req, res, next))
    .then((result) => {
      // Log successful response
      const duration = Date.now() - start;
      logger.info(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${res.statusCode} - ${duration}ms`);
      
      // If headers haven't been sent and there's a result, send it
      if (!res.headersSent && result !== undefined) {
        res.json({
          success: true,
          data: result,
        });
      }
    })
    .catch((err) => {
      // Log the error
      const duration = Date.now() - start;
      logger.error(`[${new Date().toISOString()}] ${method} ${originalUrl} - Error: ${err.message} - ${duration}ms`);
      logger.error(err.stack);
      
      // Check if it's a validation error
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        return next(new AppError(messages, 400));
      }
      
      // Check for duplicate key error
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        return next(new AppError(message, 400));
      }
      
      // Check for JWT errors
      if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token', 401));
      }
      
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token expired', 401));
      }
      
      // Default error handling
      next(err);
    });
};

// Export as default for CommonJS compatibility
module.exports = asyncHandler;
