"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipesValidator = exports.ratingValidator = exports.commentValidator = exports.recipeIdValidator = exports.updateRecipeValidator = exports.createRecipeValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_request_middleware_1 = require("@/middlewares/validate-request.middleware");
exports.createRecipeValidator = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),
    (0, express_validator_1.body)('ingredients')
        .isArray({ min: 1 })
        .withMessage('At least one ingredient is required'),
    (0, express_validator_1.body)('ingredients.*.name')
        .trim()
        .notEmpty()
        .withMessage('Ingredient name is required'),
    (0, express_validator_1.body)('ingredients.*.quantity')
        .isNumeric()
        .withMessage('Quantity must be a number')
        .isFloat({ gt: 0 })
        .withMessage('Quantity must be greater than 0'),
    (0, express_validator_1.body)('ingredients.*.unit')
        .trim()
        .notEmpty()
        .withMessage('Unit is required'),
    (0, express_validator_1.body)('instructions')
        .isArray({ min: 1 })
        .withMessage('At least one instruction is required'),
    (0, express_validator_1.body)('instructions.*.step')
        .isInt({ min: 1 })
        .withMessage('Step must be a positive integer'),
    (0, express_validator_1.body)('instructions.*.description')
        .trim()
        .notEmpty()
        .withMessage('Instruction description is required'),
    (0, express_validator_1.body)('prepTime')
        .isInt({ min: 0 })
        .withMessage('Preparation time must be a positive number'),
    (0, express_validator_1.body)('cookTime')
        .isInt({ min: 0 })
        .withMessage('Cooking time must be a positive number'),
    (0, express_validator_1.body)('servings')
        .isInt({ min: 1 })
        .withMessage('Servings must be at least 1'),
    (0, express_validator_1.body)('difficulty')
        .isIn(['easy', 'medium', 'hard'])
        .withMessage('Difficulty must be easy, medium, or hard'),
    (0, express_validator_1.body)('cuisine')
        .trim()
        .notEmpty()
        .withMessage('Cuisine is required'),
    (0, express_validator_1.body)('mealType')
        .isArray({ min: 1 })
        .withMessage('At least one meal type is required'),
    (0, express_validator_1.body)('dietaryRestrictions')
        .optional()
        .isArray(),
    (0, express_validator_1.body)('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean'),
    validate_request_middleware_1.validate
];
exports.updateRecipeValidator = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid recipe ID'),
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),
    (0, express_validator_1.body)('ingredients')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Ingredients must be a non-empty array'),
    (0, express_validator_1.body)('ingredients.*.name')
        .if((value, { req }) => {
        const ingredients = req.body.ingredients;
        return Array.isArray(ingredients) && ingredients.length > 0;
    })
        .trim()
        .notEmpty()
        .withMessage('Ingredient name is required'),
    (0, express_validator_1.body)('difficulty')
        .optional()
        .isIn(['easy', 'medium', 'hard'])
        .withMessage('Difficulty must be easy, medium, or hard'),
    validate_request_middleware_1.validate
];
exports.recipeIdValidator = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid recipe ID'),
    validate_request_middleware_1.validate
];
exports.commentValidator = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid recipe ID'),
    (0, express_validator_1.body)('text')
        .trim()
        .notEmpty()
        .withMessage('Comment text is required')
        .isLength({ max: 1000 })
        .withMessage('Comment cannot be longer than 1000 characters'),
    validate_request_middleware_1.validate
];
exports.ratingValidator = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid recipe ID'),
    (0, express_validator_1.body)('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5'),
    validate_request_middleware_1.validate
];
exports.getRecipesValidator = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('difficulty')
        .optional()
        .isIn(['easy', 'medium', 'hard'])
        .withMessage('Invalid difficulty level'),
    (0, express_validator_1.query)('cuisine')
        .optional()
        .trim(),
    validate_request_middleware_1.validate
];
//# sourceMappingURL=recipe.validator.js.map