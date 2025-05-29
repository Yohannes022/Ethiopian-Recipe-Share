import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import { ApiError } from './apiError';

/**
 * Validates the request against the provided validation chains
 * @param validations Array of validation chains
 * @returns Middleware function that validates the request
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value,
    }));

    next(ApiError.validationError('Validation failed', errorMessages));
  };
};

/**
 * Common validation rules for pagination
 */
export const paginationValidations = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  query('sort').optional().isString().withMessage('Sort must be a string'),
  query('fields').optional().isString().withMessage('Fields must be a string'),
];

/**
 * Common validation rules for ID parameters
 */
export const idParamValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

/**
 * Validation rules for user registration
 */
export const registerValidations = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

/**
 * Validation rules for user login
 */
export const loginValidations = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for password reset request
 */
export const forgotPasswordValidations = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
];

/**
 * Validation rules for password reset
 */
export const resetPasswordValidations = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

/**
 * Validation rules for updating user profile
 */
export const updateProfileValidations = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number'),
];

/**
 * Validation rules for creating a restaurant
 */
export const createRestaurantValidations = [
  body('name').trim().notEmpty().withMessage('Restaurant name is required'),
  body('description').optional().trim(),
  body('cuisine').isArray({ min: 1 }).withMessage('At least one cuisine type is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.postalCode').notEmpty().withMessage('Postal code is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('phone').isMobilePhone('any').withMessage('Please provide a valid phone number'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('website').optional().isURL().withMessage('Please provide a valid URL'),
  body('openingHours').isArray({ min: 1 }).withMessage('Opening hours are required'),
];

/**
 * Validation rules for creating a menu item
 */
export const createMenuItemValidations = [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Invalid category ID'),
  body('isVegetarian').optional().isBoolean(),
  body('isVegan').optional().isBoolean(),
  body('isGlutenFree').optional().isBoolean(),
  body('isDairyFree').optional().isBoolean(),
  body('isAvailable').optional().isBoolean(),
];

/**
 * Sanitizes request body by removing any fields not in the allowed list
 * @param allowedFields Array of allowed field names
 * @returns Middleware function that sanitizes the request body
 */
export const sanitizeBody = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const sanitizedBody: Record<string, any> = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        sanitizedBody[key] = req.body[key];
      }
    });
    
    req.body = sanitizedBody;
    next();
  };
};

/**
 * Validates file uploads
 * @param fieldName Name of the file field
 * @param allowedTypes Array of allowed MIME types
 * @param maxSizeInMB Maximum file size in MB
 * @returns Middleware function that validates file uploads
 */
export const validateFileUpload = (
  fieldName: string,
  allowedTypes: string[],
  maxSizeInMB: number
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(ApiError.badRequest(`No ${fieldName} file uploaded`));
    }

    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      return next(
        ApiError.badRequest(
          `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        )
      );
    }

    // Check file size (convert MB to bytes)
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (req.file.size > maxSizeInBytes) {
      return next(
        ApiError.badRequest(`File size exceeds the maximum limit of ${maxSizeInMB}MB`)
      );
    }

    next();
  };
};
