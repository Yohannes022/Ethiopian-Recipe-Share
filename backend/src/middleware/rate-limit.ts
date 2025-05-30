import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { cacheService } from '../services/cache.service';
import { ApiError } from '../utils/api-error';

// Rate limiting configuration
const rateLimiter = new RateLimiterRedis({
  storeClient: (cacheService as any).client, // Type assertion for now
  keyPrefix: 'rate_limit',
  points: 100, // 100 requests
  duration: 60, // per 60 seconds by IP
  blockDuration: 60 * 5, // Block for 5 minutes if limit is exceeded
});

// Rate limiting middleware
export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  // Skip rate limiting for API key authenticated requests
  if (req.headers['x-api-key']) {
    return next();
  }

  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      next(new ApiError(429, 'Too Many Requests'));
    });
};

// More aggressive rate limiting for auth endpoints
export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const limiter = new RateLimiterRedis({
    storeClient: (cacheService as any).client,
    keyPrefix: 'auth_rate_limit',
    points: 5, // 5 requests
    duration: 60, // per 60 seconds by IP
    blockDuration: 60 * 15, // Block for 15 minutes if limit is exceeded
  });

  limiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      next(new ApiError(429, 'Too Many Attempts. Please try again later.'));
    });
};
