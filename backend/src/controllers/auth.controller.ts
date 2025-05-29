import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { IUser } from '../interfaces/user.interface';
import { ApiError } from '../utils/apiError';
import { generateToken, verifyToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';
import { config } from '../config';

class AuthController {
  /**
   * Register a new user
   */
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new ApiError(400, 'User already exists with this email');
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        emailVerificationToken: crypto.randomBytes(32).toString('hex'),
      });

      // Generate JWT token
      const token = generateToken(user._id);

      // Send verification email
      const verificationUrl = `${config.clientUrl}/verify-email?token=${user.emailVerificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email',
        template: 'verifyEmail',
        context: {
          name: user.name,
          verificationUrl,
        },
      });

      // Remove sensitive data before sending response
      user.password = undefined;
      user.emailVerificationToken = undefined;

      res.status(201).json({
        status: 'success',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // 1) Check if email and password exist
      if (!email || !password) {
        throw new ApiError(400, 'Please provide email and password');
      }

      // 2) Check if user exists && password is correct
      const user = await User.findOne({ email }).select('+password');
      const isMatch = await user?.comparePassword(password);

      if (!user || !isMatch) {
        throw new ApiError(401, 'Incorrect email or password');
      }

      // 3) If everything ok, send token to client
      const token = generateToken(user._id);

      // Remove password from output
      user.password = undefined;

      res.status(200).json({
        status: 'success',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Forgot password
   */
  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      // 1) Get user based on POSTed email
      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError(404, 'There is no user with that email address');
      }

      // 2) Generate the random reset token
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      // 3) Send it to user's email
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

      try {
        await sendEmail({
          to: user.email,
          subject: 'Your password reset token (valid for 10 min)',
          template: 'passwordReset',
          context: {
            name: user.name,
            resetURL,
          },
        });

        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!',
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, 'There was an error sending the email. Try again later!');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password
   */
  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
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
        throw new ApiError(400, 'Token is invalid or has expired');
      }

      // 3) Update changedPasswordAt property for the user
      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // 4) Log the user in, send JWT
      const token = generateToken(user._id);

      res.status(200).json({
        status: 'success',
        token,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email
   */
  public verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerified: false,
      });

      if (!user) {
        throw new ApiError(400, 'Invalid or expired verification token');
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save({ validateBeforeSave: false });

      // Log the user in, send JWT
      const authToken = generateToken(user._id);

      res.status(200).json({
        status: 'success',
        token: authToken,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user
   */
  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user._id);

      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update password
   */
  public updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // 1) Get user from collection
      const user = await User.findById(req.user._id).select('+password');

      // 2) Check if POSTed current password is correct
      if (!(await user.comparePassword(currentPassword))) {
        throw new ApiError(401, 'Your current password is wrong');
      }

      // 3) If so, update password
      user.password = newPassword;
      await user.save();

      // 4) Log user in, send JWT
      const token = generateToken(user._id);

      res.status(200).json({
        status: 'success',
        token,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
