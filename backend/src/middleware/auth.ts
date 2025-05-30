import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { UnauthorizedError, ForbiddenError } from '@/utils/apiError';
import logger from '@/utils/logger';
import { promisify } from 'util';
import { env } from '@/config/config';
import { IUser } from '@/types/user.types';
import { VerifyErrors, VerifyOptions } from 'jsonwebtoken';

// Type for decoded JWT token
interface DecodedToken {
  id: string;
  iat: number;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Protect routes - require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // 1) Get token from header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      // 2) Or get token from cookie
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new UnauthorizedError('You are not logged in! Please log in to get access.')
      );
    }

    // 2) Verify token
    const verifyAsync = promisify<string, string, jwt.VerifyOptions, any>(jwt.verify);
    const decoded = await verifyAsync(token, env.JWT_SECRET, {}) as jwt.JwtPayload;

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new UnauthorizedError('The user belonging to this token no longer exists.')
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat as number)) {
      return next(
        new UnauthorizedError('User recently changed password! Please log in again.')
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error}`);
    return next(new UnauthorizedError('Invalid or expired token. Please log in again.'));
  }
};

/**
 * Restrict routes to specific roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // roles ['admin', 'owner']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError('You do not have permission to perform this action')
      );
    }
    next();
  };
};

/**
 * Only for rendered pages, no errors!
 */
export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const verifyAsync = promisify<string, string, jwt.VerifyOptions, any>(jwt.verify);
      const decoded = await verifyAsync(req.cookies.jwt, env.JWT_SECRET, {}) as jwt.JwtPayload;

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat as number)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

/**
 * Check if user is authenticated for socket connections
 */
export const socketAuth = async (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    if (!token) {
      return next({
        message: 'Authentication error: No token provided',
        code: 401
      });
    }

    const verifyAsync = promisify<string, string, jwt.VerifyOptions, any>(jwt.verify);
    const decoded = await verifyAsync(token, env.JWT_SECRET, {}) as jwt.JwtPayload;

    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return next({
        message: 'Authentication error: User not found',
        code: 401
      });
    }

    // Attach user to socket for later use
    socket.user = currentUser;
    next();
  } catch (error) {
    logger.error(`Socket authentication error: ${error}`);
    next({
      message: 'Authentication error',
      code: 401
    });
  }
};
