import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from './api-error';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (!(err instanceof ApiError)) {
        // Log unexpected errors for debugging
        console.error('Unexpected error:', err);
        next(new ApiError(500, 'Internal Server Error', false));
      } else {
        next(err);
      }
    });
  };

// Add type augmentation for Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // Will be properly typed when we have the User interface
    }
  }
}
