import { body, param, query } from 'express-validator';

// Common validation for recipe ID
const recipeIdParam = param('id')
  .isMongoId()
  .withMessage('Invalid recipe ID');

// Common validation for user ID
const userIdParam = param('userId')
  .isMongoId()
  .withMessage('Invalid user ID');

export const createRecipe = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  
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
    
  body('ingredients.*.amount')
    .notEmpty()
    .withMessage('Ingredient amount is required'),
    
  body('ingredients.*.unit')
    .trim()
    .notEmpty()
    .withMessage('Ingredient unit is required'),
    
  body('steps')
    .isArray({ min: 1 })
    .withMessage('At least one step is required'),
    
  body('steps.*.description')
    .trim()
    .notEmpty()
    .withMessage('Step description is required'),
    
  body('prepTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Preparation time must be a positive number'),
    
  body('cookTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Cooking time must be a positive number'),
    
  body('servings')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
    
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be one of: easy, medium, hard'),
    
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

export const updateRecipe = [
  recipeIdParam,
  ...createRecipe.map(validation => validation.optional())
];

export const deleteRecipe = [
  recipeIdParam
];

export const getRecipe = [
  recipeIdParam
];

export const likeRecipe = [
  recipeIdParam
];

export const commentOnRecipe = [
  recipeIdParam,
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters')
];

export const getUserRecipes = [
  userIdParam,
  query('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

export const getRecipes = [
  query('search')
    .optional()
    .trim()
    .isString()
    .withMessage('Search query must be a string'),
    
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
    
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be one of: easy, medium, hard'),
    
  query('minPrepTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum prep time must be a positive number'),
    
  query('maxPrepTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum prep time must be a positive number'),
    
  query('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
    
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'rating', 'prepTime'])
    .withMessage('Invalid sort field'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt()
];

export const searchRecipes = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isString()
    .withMessage('Search query must be a string'),
    
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
    
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be one of: easy, medium, hard'),
    
  query('minRating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Minimum rating must be between 1 and 5')
    .toFloat()
];
