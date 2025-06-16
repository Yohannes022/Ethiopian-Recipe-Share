import { body, param } from 'express-validator';
import { validate } from '@/middlewares/validate-request.middleware';

export const updateProfileValidator = [
  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 500 })
    .withMessage('Bio cannot be longer than 500 characters'),

  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
    .isLength({ max: 100 })
    .withMessage('Location cannot be longer than 100 characters'),

  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL')
    .isLength({ max: 200 })
    .withMessage('Website URL cannot be longer than 200 characters'),

  body('social.facebook')
    .optional()
    .isURL()
    .withMessage('Please provide a valid Facebook URL')
    .isLength({ max: 200 })
    .withMessage('Facebook URL cannot be longer than 200 characters'),

  body('social.twitter')
    .optional()
    .isURL()
    .withMessage('Please provide a valid Twitter URL')
    .isLength({ max: 200 })
    .withMessage('Twitter URL cannot be longer than 200 characters'),

  body('social.instagram')
    .optional()
    .isURL()
    .withMessage('Please provide a valid Instagram URL')
    .isLength({ max: 200 })
    .withMessage('Instagram URL cannot be longer than 200 characters'),

  body('social.youtube')
    .optional()
    .isURL()
    .withMessage('Please provide a valid YouTube URL')
    .isLength({ max: 200 })
    .withMessage('YouTube URL cannot be longer than 200 characters'),

  validate,
];

export const userIdValidator = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  validate,
];
