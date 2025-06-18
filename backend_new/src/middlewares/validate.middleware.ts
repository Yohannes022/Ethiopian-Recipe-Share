import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';
import AppError from '@/utils/appError';

interface ValidationErrorMessage {
  field: string;
  message: string;
}

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map((err: ValidationError) => {
      const error = err as any; // Type assertion to access non-standard properties
      return {
        field: error.param || error.location,
        message: error.msg || 'Invalid value'
      };
    });

    return next(new AppError('Validation failed', 400, errorMessages));
  };
};

export const validateRequest = (validations: ValidationChain[]) => {
  return [
    ...validations,
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err: ValidationError) => {
          const error = err as any; // Type assertion to access non-standard properties
          return {
            field: error.param || error.location,
            message: error.msg || 'Invalid value'
          };
        });
        return next(new AppError('Validation failed', 400, errorMessages));
      }
      next();
    }
  ];
};
