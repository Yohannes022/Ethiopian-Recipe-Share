import { body, param } from 'express-validator';

export const createRestaurant = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Restaurant name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
    
  body('cuisine')
    .isArray({ min: 1 })
    .withMessage('At least one cuisine type is required'),
    
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
    
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Invalid coordinates format. Must be [longitude, latitude]'),
    
  body('location.coordinates.*')
    .isNumeric()
    .withMessage('Coordinates must be numbers'),
    
  body('contact.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
    
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
    
  body('openingHours')
    .optional()
    .isObject()
    .withMessage('Opening hours must be an object'),
    
  body('priceRange')
    .optional()
    .isIn(['$', '$$', '$$$', '$$$$'])
    .withMessage('Price range must be one of: $, $$, $$$, or $$$$'),
    
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

export const updateRestaurant = [
  ...createRestaurant.map(validation => validation.optional()),
  param('id').isMongoId().withMessage('Invalid restaurant ID')
];

export const deleteRestaurant = [
  param('id').isMongoId().withMessage('Invalid restaurant ID')
];

export const getRestaurant = [
  param('id').isMongoId().withMessage('Invalid restaurant ID')
];

export const getRestaurantMenu = [
  param('restaurantId').isMongoId().withMessage('Invalid restaurant ID')
];

export const reviewRestaurant = [
  param('restaurantId').isMongoId().withMessage('Invalid restaurant ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters')
];

export const getOwnerRestaurants = [
  param('ownerId').isMongoId().withMessage('Invalid owner ID')
];
