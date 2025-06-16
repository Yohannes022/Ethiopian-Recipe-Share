import { body, param, query } from 'express-validator';
import { validate } from '@/middlewares/validate-request.middleware';

export const createRecipeValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
    
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
    
  body('ingredients.*.name')
    .trim()
    .notEmpty()
    .withMessage('Ingredient name is required'),
    
  body('ingredients.*.quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .isFloat({ gt: 0 })
    .withMessage('Quantity must be greater than 0'),
    
  body('ingredients.*.unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
    
  body('instructions')
    .isArray({ min: 1 })
    .withMessage('At least one instruction is required'),
    
  body('instructions.*.step')
    .isInt({ min: 1 })
    .withMessage('Step must be a positive integer'),
    
  body('instructions.*.description')
    .trim()
    .notEmpty()
    .withMessage('Instruction description is required'),
    
  body('prepTime')
    .isInt({ min: 0 })
    .withMessage('Preparation time must be a positive number'),
    
  body('cookTime')
    .isInt({ min: 0 })
    .withMessage('Cooking time must be a positive number'),
    
  body('servings')
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
    
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
    
  body('cuisine')
    .trim()
    .notEmpty()
    .withMessage('Cuisine is required'),
    
  body('mealType')
    .isArray({ min: 1 })
    .withMessage('At least one meal type is required'),
    
  body('dietaryRestrictions')
    .optional()
    .isArray(),
    
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
    
  validate
];

export const updateRecipeValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid recipe ID'),
    
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
    
  body('ingredients')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Ingredients must be a non-empty array'),
    
  body('ingredients.*.name')
    .if((value, { req }) => {
      const ingredients = req.body.ingredients;
      return Array.isArray(ingredients) && ingredients.length > 0;
    })
    .trim()
    .notEmpty()
    .withMessage('Ingredient name is required'),
    
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
    
  validate
];

export const recipeIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid recipe ID'),
    
  validate
];

export const commentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid recipe ID'),
    
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot be longer than 1000 characters'),
    
  validate
];

export const ratingValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid recipe ID'),
    
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
    
  validate
];

export const getRecipesValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
    
  query('cuisine')
    .optional()
    .trim(),
    
  validate
];
