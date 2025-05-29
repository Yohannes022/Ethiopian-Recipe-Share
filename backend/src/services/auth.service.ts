import { User, IUser } from '../models/User';
import { ApiError } from '../utils/apiError';
import { signToken } from '../middleware/auth';
import { sendEmail } from '../utils/email';
import { Document, Types } from 'mongoose';
import crypto from 'crypto';

/**
 * Service for handling authentication operations
 */
class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }): Promise<{ user: IUser & Document; token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw ApiError.conflict('Email already in use');
    }

    // Create new user
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user',
      phone: userData.phone,
    });

    // Generate JWT token
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    return { user, token };
  }

  /**
   * Login user
   */
  static async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: IUser & Document; token: string }> {
    // 1) Check if email and password exist
    if (!credentials.email || !credentials.password) {
      throw ApiError.badRequest('Please provide email and password');
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email: credentials.email }).select('+password');
    
    if (!user || !(await user.correctPassword(credentials.password, user.password))) {
      throw ApiError.unauthorized('Incorrect email or password');
    }

    // 3) If everything ok, send token to client
    const token = signToken(user._id);

    // 4) Remove password from output
    user.password = undefined;

    // 5) Update last login
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save({ validateBeforeSave: false });

    return { user, token };
  }

  /**
   * Forgot password - send reset token to user's email
   */
  static async forgotPassword(email: string): Promise<void> {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if the email exists or not
      return;
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    try {
      const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        template: 'passwordReset',
        data: {
          name: user.name,
          resetURL,
        },
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw ApiError.internalError('There was an error sending the email. Try again later.');
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(
    token: string,
    password: string
  ): Promise<{ user: IUser & Document; token: string }> {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      throw ApiError.badRequest('Token is invalid or has expired');
    }

    // 3) Update changedPasswordAt property for the user
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Log the user in, send JWT
    const authToken = signToken(user._id);

    return { user, token: authToken };
  }

  /**
   * Update current user's password
   */
  static async updatePassword(
    userId: Types.ObjectId,
    currentPassword: string,
    newPassword: string
  ): Promise<{ user: IUser & Document; token: string }> {
    // 1) Get user from collection
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      throw ApiError.unauthorized('Your current password is wrong');
    }

    // 3) If so, update password
    user.password = newPassword;
    await user.save();

    // 4) Log user in, send JWT
    const token = signToken(user._id);

    return { user, token };
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<void> {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.badRequest('Token is invalid or has expired');
    }

    // 2) Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(user: IUser & Document): Promise<void> {
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      
      await sendEmail({
        email: user.email,
        subject: 'Verify your email',
        template: 'verifyEmail',
        data: {
          name: user.name,
          verificationUrl,
        },
      });
    } catch (err) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw ApiError.internalError('There was an error sending the verification email.');
    }
  }
}

export default AuthService;
