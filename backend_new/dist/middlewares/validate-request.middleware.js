"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const appError_1 = __importDefault(require("@/utils/appError"));
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.type === 'field' ? err.path : 'unknown',
            message: err.msg
        }));
        return next(new appError_1.default('Validation failed', 400, errorMessages));
    }
    next();
};
exports.validateRequest = validateRequest;
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        return (0, exports.validateRequest)(req, res, next);
    };
};
exports.validate = validate;
//# sourceMappingURL=validate-request.middleware.js.map