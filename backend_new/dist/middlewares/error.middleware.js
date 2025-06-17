"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.errorHandler = exports.notFound = exports.AppError = void 0;
const logger_1 = __importDefault(require("@/utils/logger"));
class AppError extends Error {
    constructor(message, statusCode, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.code = code || 'INTERNAL_SERVER_ERROR';
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const notFound = (req, res, next) => {
    const error = new AppError(`Can't find ${req.originalUrl} on this server!`, 404, 'NOT_FOUND');
    next(error);
};
exports.notFound = notFound;
const errorHandler = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong';
    let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
    let details = err.details;
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errorCode = 'VALIDATION_ERROR';
        details = Object.values(err.errors).map((el) => ({
            field: el.path,
            message: el.message,
        }));
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        errorCode = 'INVALID_INPUT';
    }
    else if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value entered';
        errorCode = 'DUPLICATE_KEY';
        details = { field: Object.keys(err.keyValue) };
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again!';
        errorCode = 'INVALID_TOKEN';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your token has expired! Please log in again.';
        errorCode = 'TOKEN_EXPIRED';
    }
    const errorStack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    const logMessage = `[${req.method}] ${req.originalUrl} - ${statusCode} - ${message} - ${req.ip} - ${req.get('user-agent')}`;
    if (statusCode >= 500) {
        logger_1.default.error(logMessage, { stack: errorStack, error: err });
    }
    else if (statusCode >= 400) {
        logger_1.default.warn(logMessage);
    }
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Something went wrong!';
        details = undefined;
    }
    const errorResponse = {
        status: 'error',
        message,
        error: {
            code: errorCode,
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
        timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
};
exports.catchAsync = catchAsync;
//# sourceMappingURL=error.middleware.js.map