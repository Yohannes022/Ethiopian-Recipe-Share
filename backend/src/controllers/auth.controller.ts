import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '@/models/User';
import Email from '@/utils/email';
import { createAndSendToken } from '@/utils/token';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '@/utils/apiError';
import { IUser } from '@/types/user.types';
import logger from '@/utils/logger';

// Sign up a new user
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, passwordConfirm, role } = req.body;

    // 1) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    // 2) Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      role: role || 'user',
    });

    // 3) Generate email verification token
    const verificationToken = newUser.createEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    // 4) Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
    
    try {
      await new Email(newUser, verificationUrl).sendWelcome();
    } catch (err) {
      logger.error(`Error sending welcome email: ${err}`);
      // Don't fail the request if email sending fails
    }

    // 5) Generate token and send response
    createAndSendToken(newUser, 201, res);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      return next(new ValidationError(errors));
    }
    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new UnauthorizedError('Incorrect email or password');
    }

    // 3) Check if user is active
    if (!user.active) {
      throw new UnauthorizedError('This account has been deactivated');
    }

    // 4) Update login info
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save({ validateBeforeSave: false });

    // 5) If everything ok, send token to client
    createAndSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// Protect routes - check if user is authenticated
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    
    // 1) Get token and check if it's there
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new UnauthorizedError('You are not logged in! Please log in to get access.');
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET as string);

    // 3) Check if user still exists
    const currentUser = await User.findById((decoded as any).id);
    if (!currentUser) {
      throw new UnauthorizedError('The user belonging to this token no longer exists.');
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter((decoded as any).iat)) {
      throw new UnauthorizedError('User recently changed password! Please log in again.');
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

// Restrict to certain roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // roles is an array of allowed roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }
    next();
  };
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new NotFoundError('There is no user with that email address.');
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
    
    try {
      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error(`Error sending password reset email: ${err}`);
      throw new Error('There was an error sending the email. Try again later!');
    }
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      throw new BadRequestError('Token is invalid or has expired');
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // This is handled by a pre-save middleware in the User model

    // 4) Log the user in, send JWT
    createAndSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Update password
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      throw new UnauthorizedError('Your current password is wrong');
    }

    // 3) If so, update password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createAndSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError('Token is invalid or has expired');
    }

    // 2) Update user document
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // 3) Log the user in, send JWT
    createAndSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Resend verification email
export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // 1) Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email already verified');
    }

    // 2) Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
    
    try {
      await new Email(user, verificationUrl).sendEmailVerification();

      res.status(200).json({
        status: 'success',
        message: 'Verification email sent!',
      });
    } catch (err) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error(`Error sending verification email: ${err}`);
      throw new Error('There was an error sending the email. Try again later!');
    }
  } catch (error) {
    next(error);
  }
};
