import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';
import { isHttpError } from 'http-errors';

export interface IErrorResponse {
  status: 'error';
  message: string;
  error: {
    code: string;
    details?: any;
    stack?: string;
  };
  timestamp: string;
}

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code || 'INTERNAL_SERVER_ERROR';
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // Default values for error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let details = err.details;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorCode = 'VALIDATION_ERROR';
    details = Object.values(err.errors).map((el: any) => ({
      field: el.path,
      message: el.message,
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errorCode = 'INVALID_INPUT';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errorCode = 'DUPLICATE_KEY';
    details = { field: Object.keys(err.keyValue) };
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again!';
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired! Please log in again.';
    errorCode = 'TOKEN_EXPIRED';
  }

  // Log the error
  const errorStack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  const logMessage = `[${req.method}] ${req.originalUrl} - ${statusCode} - ${message} - ${req.ip} - ${req.get('user-agent')}`;
  
  if (statusCode >= 500) {
    logger.error(logMessage, { stack: errorStack, error: err });
  } else if (statusCode >= 400) {
    logger.warn(logMessage);
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong!';
    details = undefined;
  }

  // Send error response
  const errorResponse: IErrorResponse = {
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

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
