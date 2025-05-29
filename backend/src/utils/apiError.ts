import { IApiError } from '../interfaces/error.interface';

export class ApiError extends Error implements IApiError {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: number | string;
  errors?: any[];
  path?: string;
  value?: any;
  keyValue?: any;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static validationError(message = 'Validation error', errors: any[] = []) {
    const error = new ApiError(422, message);
    error.errors = errors;
    return error;
  }

  static internalError(message = 'Internal server error') {
    return new ApiError(500, message, false);
  }

  static serviceUnavailable(message = 'Service unavailable') {
    return new ApiError(503, message, false);
  }
}

export const isOperationalError = (error: Error) => {
  if (error instanceof ApiError) {
    return error.isOperational;
  }
  return false;
};

export const handleError = (error: IApiError, res: any) => {
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const message = error.message || 'Something went wrong';

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status,
      message,
      error,
      stack: error.stack,
    });
  } else {
    // In production, don't leak error details
    res.status(statusCode).json({
      status,
      message: message,
    });
  }
};
