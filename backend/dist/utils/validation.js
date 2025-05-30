"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePagination = exports.validateRequest = void 0;
const apiError_1 = require("./apiError");
// Helper functions
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const isValidPassword = (password) => {
    return password.length >= 8;
};
// Request validation middleware
const validateRequest = (req, res, next) => {
    const errors = [];
    // Validate required fields
    const requiredFields = ['name', 'email', 'password'];
    requiredFields.forEach(field => {
        if (!req.body[field]) {
            errors.push({
                field,
                message: `${field} is required`,
            });
        }
    });
    // Validate email format
    if (req.body.email && !isValidEmail(req.body.email)) {
        errors.push({
            field: 'email',
            message: 'Invalid email format',
        });
    }
    // Validate password strength
    if (req.body.password && !isValidPassword(req.body.password)) {
        errors.push({
            field: 'password',
            message: 'Password must be at least 8 characters long',
        });
    }
    if (errors.length > 0) {
        throw new apiError_1.ApiError('Validation failed', 400);
    }
    next();
};
exports.validateRequest = validateRequest;
// Pagination validation middleware
const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;
    if (page && isNaN(Number(page))) {
        throw new apiError_1.ApiError('Invalid page number', 400);
    }
    if (limit && isNaN(Number(limit))) {
        throw new apiError_1.ApiError('Invalid limit number', 400);
    }
    next();
};
exports.validatePagination = validatePagination;
