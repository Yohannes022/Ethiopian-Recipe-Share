import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

/**
 * Rate limiting middleware to prevent abuse of the API
 * Applies different limits based on the environment
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // limit each IP to 100 requests per windowMs in production
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    throw new ApiError(429, options.message);
  },
});

/**
 * Stricter rate limiting for authentication routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 10, // limit each IP to 10 requests per windowMs in production
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    throw new ApiError(429, options.message);
  },
});

export { apiLimiter, authLimiter };
