import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiError } from '../../utils/apiError';

/**
 * Async handler to wrap each route and handle errors
 */
export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => 
    Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Validates the request against the provided validation chains
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    next(new ApiError(400, 'Validation failed', errors.array()));
  };
};

/**
 * Creates a middleware that validates the request body against a schema
 */
export const validateSchema = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }
    next();
  };
};
