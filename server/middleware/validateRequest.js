const { validationResult, matchedData } = require('express-validator');
const AppError = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * Middleware to validate request data against validation rules
 * @param {Array} validations - Array of validation chains
 * @returns {Function} Express middleware function
 */
const validateRequest = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      // Get validation errors
      const errors = validationResult(req);
      
      // If there are validation errors
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
          field: err.param,
          message: err.msg,
          value: err.value,
          location: err.location,
        }));
        
        logger.warn('Validation failed', {
          path: req.path,
          method: req.method,
          errors: errorMessages,
          body: req.body,
          params: req.params,
          query: req.query,
          user: req.user ? req.user._id : 'anonymous',
        });
        
        return next(
          AppError.validationError(errorMessages)
        );
      }

      // Attach validated data to request object
      req.validated = matchedData(req, { locations: ['body', 'params', 'query'] });
      
      // Proceed to the next middleware/controller
      next();
    } catch (error) {
      logger.error('Validation middleware error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
      });
      next(error);
    }
  };
};

/**
 * Middleware to handle file upload validation
 * @param {string} fieldName - Field name for the file
 * @param {Array} allowedMimeTypes - Allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Function} Express middleware function
 */
const validateFileUpload = (fieldName, allowedMimeTypes, maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError(`No file uploaded for ${fieldName}`, 400, 'NO_FILE_UPLOADED'));
      }

      // Check file type
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return next(
          new AppError(
            `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
            400,
            'INVALID_FILE_TYPE'
          )
        );
      }

      // Check file size
      if (req.file.size > maxSize) {
        return next(
          new AppError(
            `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
            400,
            'FILE_TOO_LARGE'
          )
        );
      }

      // Attach file info to request object
      req.fileInfo = {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validateRequest,
  validateFileUpload,
  validationResult,
};
