"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const apiError_1 = require("@/utils/apiError");
const logger_1 = __importDefault(require("@/utils/logger"));
const errorHandler = (err, req, res, next) => {
    // Default error status code and message
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // Log the error in development
    if (process.env.NODE_ENV === 'development') {
        logger_1.default.error({
            message: err.message,
            stack: err.stack,
            name: err.name,
        });
    }
    // Handle specific error types
    if (err.name === 'ValidationError') {
        const errors = {};
        Object.values(err.errors).forEach((error) => {
            errors[error.path] = error.message;
        });
        return res.status(400).json({
            status: 'fail',
            message: 'Validation Error',
            errors,
        });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token. Please log in again!',
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'Your token has expired! Please log in again.',
        });
    }
    if (err.code === 11000) {
        const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
        const message = `Duplicate field value: ${value}. Please use another value!`;
        return res.status(400).json({
            status: 'fail',
            message,
        });
    }
    // For custom API errors
    if (err instanceof apiError_1.ApiError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }
    // For any other errors
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    next(new apiError_1.ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
};
exports.notFoundHandler = notFoundHandler;
