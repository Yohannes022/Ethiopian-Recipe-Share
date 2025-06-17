import { NextFunction, Request, RequestHandler, Response } from 'express';
import AppError from './appError';

/**
 * Wraps an async function to handle errors and pass them to Express error handling middleware
 * @param fn The async function to wrap
 * @returns A function that handles errors in the async function
 */
const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: Error) => {
      next(err);
    });
  };
};

export default catchAsync;
