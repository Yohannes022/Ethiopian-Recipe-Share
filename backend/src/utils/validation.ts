import { IValidationError } from '@/interfaces/error';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './apiError';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors: IValidationError[] = [];

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
    throw new ApiError(400, 'Validation failed', errors);
  }

  next();
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.query;

  if (page && isNaN(Number(page))) {
    throw new ApiError(400, 'Invalid page number');
  }

  if (limit && isNaN(Number(limit))) {
    throw new ApiError(400, 'Invalid limit number');
  }

  next();
};
