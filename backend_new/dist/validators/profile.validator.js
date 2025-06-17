"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdValidator = exports.updateProfileValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_request_middleware_1 = require("@/middlewares/validate-request.middleware");
exports.updateProfileValidator = [
    (0, express_validator_1.body)('bio')
        .optional()
        .isString()
        .withMessage('Bio must be a string')
        .isLength({ max: 500 })
        .withMessage('Bio cannot be longer than 500 characters'),
    (0, express_validator_1.body)('location')
        .optional()
        .isString()
        .withMessage('Location must be a string')
        .isLength({ max: 100 })
        .withMessage('Location cannot be longer than 100 characters'),
    (0, express_validator_1.body)('website')
        .optional()
        .isURL()
        .withMessage('Please provide a valid URL')
        .isLength({ max: 200 })
        .withMessage('Website URL cannot be longer than 200 characters'),
    (0, express_validator_1.body)('social.facebook')
        .optional()
        .isURL()
        .withMessage('Please provide a valid Facebook URL')
        .isLength({ max: 200 })
        .withMessage('Facebook URL cannot be longer than 200 characters'),
    (0, express_validator_1.body)('social.twitter')
        .optional()
        .isURL()
        .withMessage('Please provide a valid Twitter URL')
        .isLength({ max: 200 })
        .withMessage('Twitter URL cannot be longer than 200 characters'),
    (0, express_validator_1.body)('social.instagram')
        .optional()
        .isURL()
        .withMessage('Please provide a valid Instagram URL')
        .isLength({ max: 200 })
        .withMessage('Instagram URL cannot be longer than 200 characters'),
    (0, express_validator_1.body)('social.youtube')
        .optional()
        .isURL()
        .withMessage('Please provide a valid YouTube URL')
        .isLength({ max: 200 })
        .withMessage('YouTube URL cannot be longer than 200 characters'),
    validate_request_middleware_1.validate,
];
exports.userIdValidator = [
    (0, express_validator_1.param)('userId')
        .isMongoId()
        .withMessage('Invalid user ID'),
    validate_request_middleware_1.validate,
];
//# sourceMappingURL=profile.validator.js.map