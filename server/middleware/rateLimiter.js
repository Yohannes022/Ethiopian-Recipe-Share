const rateLimit = require('express-rate-limit');
const AppError = require('../utils/errorResponse');
const logger = require('../utils/logger');
const config = require('../config/config');

// Key generator function for rate limiting
const keyGenerator = (req) => {
  // Use user ID if authenticated, otherwise use IP address
  return req.user ? `user:${req.user._id}` : `ip:${req.ip}`;
};

// Skip function for rate limiting
const skipRateLimit = (req) => {
  // Skip rate limiting for admin users and certain paths
  const skipPaths = ['/api/v1/health', '/api/v1/status'];
  return (
    (req.user && req.user.role === 'admin') ||
    skipPaths.includes(req.path)
  );
};

/**
 * Create a rate limiter with the specified window and max requests
 * @param {number} windowMs - Time frame for which requests are checked (in milliseconds)
 * @param {number} max - Maximum number of requests allowed in the window
 * @param {string} message - Error message when rate limit is exceeded
 * @param {Object} options - Additional options for the rate limiter
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (windowMs, max, message, options = {}) => {
  return rateLimit({
    windowMs,
    max,
    message,
    keyGenerator,
    skip: skipRateLimit,
    ...options,
    handler: (req, res, next, options) => {
      const clientId = req.user ? `user:${req.user._id}` : `ip:${req.ip}`;
      logger.warn(
        `Rate limit exceeded for ${clientId} on ${req.method} ${req.originalUrl}`
      );
      
      next(
        new AppError(
          options.message,
          429,
          'RATE_LIMIT_EXCEEDED',
          {
            retryAfter: Math.ceil(options.windowMs / 1000), // in seconds
            limit: options.max,
            current: req.rateLimit.current,
            remaining: req.rateLimit.remaining,
            resetTime: new Date(Date.now() + options.windowMs).toISOString(),
          }
        )
      );
    },
    // Add rate limit info to response headers
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Store for rate limiting (can be Redis in production)
    store: options.store || undefined,
  });
};

// Global rate limiter (applied to all routes)
const globalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // Limit each client to 100 requests per windowMs
  'Too many requests from this IP, please try again after 15 minutes',
  {
    message: 'Too many requests, please try again later.',
  }
);

// Auth rate limiter (for login, register, password reset, etc.)
const authLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // Limit each client to 10 requests per windowMs
  'Too many auth attempts, please try again after an hour',
  {
    message: 'Too many login attempts, please try again later.',
  }
);

// API route rate limiter (for public API endpoints)
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // Limit each client to 1000 requests per windowMs
  'API rate limit exceeded, please try again after 15 minutes',
  {
    message: 'API rate limit exceeded, please try again later.',
  }
);

// File upload rate limiter (more restrictive)
const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  20, // Limit each client to 20 uploads per hour
  'Too many file uploads, please try again after an hour',
  {
    message: 'Too many file uploads, please try again later.',
  }
);

// Password reset rate limiter (very restrictive)
const passwordResetLimiter = createRateLimiter(
  24 * 60 * 60 * 1000, // 24 hours
  3, // Limit each client to 3 password reset attempts per day
  'Too many password reset attempts, please try again tomorrow',
  {
    message: 'Too many password reset attempts, please try again later.',
  }
);

// Export all rate limiters
module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  passwordResetLimiter,
  createRateLimiter, // Export for custom limiters
};
