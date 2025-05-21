const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const AppError = require('../utils/errorResponse');
const logger = require('../utils/logger');
const { rateLimit } = require('express-rate-limit');
const { RateLimiterMemory } = 'rate-limiter-flexible';

// Promisify JWT functions
const verifyToken = promisify(jwt.verify);

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
});

// Rate limiter for refresh tokens
const refreshTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 refresh token requests per hour
  message: 'Too many refresh token requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // Limit each IP to 5 password reset requests per day
  message: 'Too many password reset attempts, please try again tomorrow',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Middleware to protect routes - verifies JWT token
 */
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || '';
  
  // Get token from header, cookie, or query string
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.query?.token) {
    token = req.query.token;
  }

  // Make sure token exists
  if (!token) {
    logger.warn('No token provided', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    return next(
      new AppError(
        'You are not logged in! Please log in to get access.',
        401,
        'UNAUTHORIZED'
      )
    );
  }

  try {
    // Verify token
    const decoded = await verifyToken(token, process.env.JWT_ACCESS_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
    
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND')
      );
    }

    // Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401, 'PASSWORD_CHANGED')
      );
    }
    
    // Check if user account is active
    if (!currentUser.isActive) {
      return next(
        new AppError('Your account has been deactivated. Please contact support.', 401, 'ACCOUNT_DEACTIVATED')
      );
    }
    
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    
    // Log successful authentication
    logger.info('User authenticated', {
      userId: currentUser._id,
      email: currentUser.email,
      role: currentUser.role,
      path: req.path,
      method: req.method,
    });
    
    next();
  } catch (error) {
    logger.error('Authentication error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN'));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(
        new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED')
      );
    }
    
    next(error);
  }
};

/**
 * Middleware to verify refresh token
 */
const verifyRefreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return next(
      new AppError('No refresh token provided', 400, 'REFRESH_TOKEN_REQUIRED')
    );
  }
  
  try {
    const decoded = await verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND')
      );
    }
    
    // Check if refresh token is still valid
    if (currentUser.refreshToken !== refreshToken) {
      return next(
        new AppError('Invalid refresh token. Please log in again!', 401, 'INVALID_REFRESH_TOKEN')
      );
    }
    
    // Attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    logger.error('Refresh token error', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(
        new AppError('Invalid or expired refresh token. Please log in again!', 401, 'INVALID_REFRESH_TOKEN')
      );
    }
    
    next(error);
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401, 'NOT_LOGGED_IN')
      );
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method,
      });
      
      return next(
        new AppError(
          `You do not have permission to perform this action. Required role: ${roles.join(' or ')}`,
          403,
          'FORBIDDEN'
        )
      );
    }
    
    next();
  };
};

/**
 * Middleware to check resource ownership
 * @param {string} resourceOwnerId - The ID of the resource owner
 * @param {boolean} allowAdmin - Whether to allow admin to bypass ownership check
 */
const checkOwnership = (resourceOwnerId, allowAdmin = true) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401, 'NOT_LOGGED_IN')
      );
    }
    
    // Allow admins to bypass ownership check if allowAdmin is true
    if (allowAdmin && req.user.role === 'admin') {
      return next();
    }
    
    // Check if user is the owner of the resource
    if (resourceOwnerId.toString() !== req.user._id.toString()) {
      logger.warn('Unauthorized ownership access', {
        userId: req.user._id,
        resourceOwnerId,
        path: req.path,
        method: req.method,
      });
      
      return next(
        new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN')
      );
    }
    
    next();
  };
};

/**
 * Middleware to check if email is verified
 */
const checkEmailVerified = (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401, 'NOT_LOGGED_IN')
    );
  }
  
  if (!req.user.isEmailVerified) {
    return next(
      new AppError(
        'Please verify your email address to access this resource.',
        403,
        'EMAIL_NOT_VERIFIED'
      )
    );
  }
  
  next();
};

/**
 * Middleware to check if phone is verified
 */
const checkPhoneVerified = (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401, 'NOT_LOGGED_IN')
    );
  }
  
  if (!req.user.isPhoneVerified) {
    return next(
      new AppError(
        'Please verify your phone number to access this resource.',
        403,
        'PHONE_NOT_VERIFIED'
      )
    );
  }
  
  next();
};

// Export all middleware functions
module.exports = {
  protect,
  verifyRefreshToken,
  restrictTo,
  checkOwnership,
  checkEmailVerified,
  checkPhoneVerified,
  authLimiter,
  refreshTokenLimiter,
  passwordResetLimiter,
};
