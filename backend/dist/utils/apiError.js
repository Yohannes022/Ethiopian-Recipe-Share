"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableError = exports.InternalServerError = exports.RateLimitError = exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.ApiError = void 0;
/**
 * Base API Error Class
 */
class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
/**
 * 400 Bad Request
 */
class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
/**
 * 401 Unauthorized
 */
class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * 403 Forbidden
 */
class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * 404 Not Found
 */
class NotFoundError extends ApiError {
    constructor(message = 'Not Found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * 409 Conflict
 */
class ConflictError extends ApiError {
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
/**
 * 422 Unprocessable Entity
 */
class ValidationError extends ApiError {
    constructor(errors) {
        super('Validation Error', 422);
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
/**
 * 429 Too Many Requests
 */
class RateLimitError extends ApiError {
    constructor(message = 'Too many requests, please try again later.') {
        super(message, 429);
    }
}
exports.RateLimitError = RateLimitError;
/**
 * 500 Internal Server Error
 */
class InternalServerError extends ApiError {
    constructor(message = 'Internal Server Error') {
        super(message, 500);
    }
}
exports.InternalServerError = InternalServerError;
/**
 * 503 Service Unavailable
 */
class ServiceUnavailableError extends ApiError {
    constructor(message = 'Service Unavailable') {
        super(message, 503);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
