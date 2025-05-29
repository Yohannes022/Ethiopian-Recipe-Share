import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { Request, Response, NextFunction } from 'express';
import { IApiError } from '../interfaces/error.interface';
import logger from '../utils/logger';

// Rate limiting options
const rateLimitOptions: rateLimit.Options = {
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  handler: (req: Request, res: Response, next: NextFunction, options: any) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    
    const error = new Error('Too many requests, please try again later.') as IApiError;
    error.statusCode = 429;
    next(error);
  },
  keyGenerator: (req: Request) => {
    // Use IP + user ID if authenticated for more granular rate limiting
    return req.user ? `${req.user._id}-${req.ip}` : req.ip;
  },
};

// Create rate limiter middleware
const rateLimiter = rateLimit(rateLimitOptions);

// Special rate limiter for auth routes
const authRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
});

// Special rate limiter for public APIs
const apiRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 requests per hour
  message: 'Too many API requests, please try again later.',
});

export { rateLimiter, authRateLimiter, apiRateLimiter };

// This middleware can be used in routes like this:
// router.post('/login', authRateLimiter, authController.login);
// router.get('/api/data', apiRateLimiter, dataController.getData);
