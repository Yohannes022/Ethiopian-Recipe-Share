// Authentication & Authorization
const {
  protect,
  verifyRefreshToken,
  restrictTo,
  checkOwnership,
  checkEmailVerified,
  checkPhoneVerified,
  authLimiter,
  refreshTokenLimiter,
  passwordResetLimiter,
} = require('./auth');

// Error handling
const errorHandler = require('./errorHandler');
const notFoundHandler = require('./notFoundHandler');

// Request processing
const requestLogger = require('./requestLogger');
const validateRequest = require('./validateRequest');

// Security
const securityMiddleware = require('./security');
const cors = require('./cors');
const {
  uploadFile,
  uploadFiles,
  deleteFile,
  allowedImageTypes,
  allowedFileTypes,
} = require('./upload');

// Rate limiting
const { globalLimiter } = require('./rateLimiter');

module.exports = {
  // Authentication & Authorization
  protect,
  verifyRefreshToken,
  restrictTo,
  checkOwnership,
  checkEmailVerified,
  checkPhoneVerified,
  authLimiter,
  refreshTokenLimiter,
  passwordResetLimiter,
  
  // Error handling
  errorHandler,
  notFoundHandler,
  
  // Request processing
  requestLogger,
  validateRequest,
  
  // Security
  securityMiddleware,
  cors,
  
  // File uploads
  uploadFile,
  uploadFiles,
  deleteFile,
  allowedImageTypes,
  allowedFileTypes,
  
  // Rate limiting
  globalLimiter,
};
