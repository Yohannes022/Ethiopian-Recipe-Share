import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../interfaces/user.interface';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';
import { config } from '../config';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Protect routes - require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // 1) Get token and check if it exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new ApiError(401, 'You are not logged in! Please log in to get access.');
    }

    // 2) Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new ApiError(401, 'The user belonging to this token no longer exists.');
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat as number)) {
      throw new ApiError(401, 'User recently changed password! Please log in again.');
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict routes to specific roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role as string)) {
      return next(
        new ApiError(403, 'You do not have permission to perform this action')
      );
    }
    next();
  };
};

/**
 * Check if user is logged in (optional authentication)
 */
export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.cookies?.jwt) {
      // 1) Verify token
      const decoded = jwt.verify(
        req.cookies.jwt,
        config.jwt.secret
      ) as { id: string };

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
      req.user = currentUser;
    }
    next();
  } catch (err) {
    next();
  }
};
