/**
 * Base API Error Class
 */
export class ApiError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * 422 Unprocessable Entity
 */
export class ValidationError extends ApiError {
  errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super('Validation Error', 422);
    this.errors = errors;
  }
}

/**
 * 429 Too Many Requests
 */
export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests, please try again later.') {
    super(message, 429);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service Unavailable') {
    super(message, 503);
  }
}
