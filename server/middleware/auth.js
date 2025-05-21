const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware to protect routes - verifies JWT token
 */
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header or cookie
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return next(new ErrorResponse('User no longer exists', 401));
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Token expired, please log in again', 401));
    }
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

/**
 * Middleware to authorize user roles
 * @param {...string} roles - Allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Middleware to check if user is the owner of a resource
 * @param {string} resourceUserId - ID of the resource owner
 */
exports.checkOwnership = (resourceUserId) => {
  return (req, res, next) => {
    // Allow admins to bypass ownership check
    if (req.user.role === 'admin') return next();
    
    // Check if user is the owner of the resource
    if (resourceUserId.toString() !== req.user.id) {
      return next(
        new ErrorResponse('Not authorized to perform this action', 403)
      );
    }
    next();
  };
};
