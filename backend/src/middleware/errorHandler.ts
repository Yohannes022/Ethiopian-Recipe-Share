import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/apiError';
import logger from '@/utils/logger';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  code?: number;
  errors?: Record<string, any>;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error status code and message
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    logger.error({
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const errors: Record<string, string> = {};
    Object.values((err as any).errors).forEach((error: any) => {
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
    const value = (err as any).errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return res.status(400).json({
      status: 'fail',
      message,
    });
  }

  // For custom API errors
  if (err instanceof ApiError) {
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

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
};
