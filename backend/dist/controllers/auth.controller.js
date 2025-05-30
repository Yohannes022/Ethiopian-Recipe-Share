"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationEmail = exports.verifyEmail = exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.restrictTo = exports.protect = exports.logout = exports.login = exports.signup = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const util_1 = require("util");
const User_1 = __importDefault(require("@/models/User"));
const email_1 = __importDefault(require("@/utils/email"));
const token_1 = require("@/utils/token");
const config_1 = require("@/config/config");
const apiError_1 = require("@/utils/apiError");
const logger_1 = __importDefault(require("@/utils/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
// Sign up a new user
const signup = async (req, res, next) => {
    try {
        const { name, email, password, passwordConfirm, role } = req.body;
        // 1) Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            throw new apiError_1.BadRequestError('Email already in use');
        }
        // 2) Create new user
        const newUser = await User_1.default.create({
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
            await new email_1.default(newUser, verificationUrl).sendWelcome();
        }
        catch (err) {
            logger_1.default.error(`Error sending welcome email: ${err}`);
            // Don't fail the request if email sending fails
        }
        // 5) Generate token and send response
        (0, token_1.createAndSendToken)(newUser, 201, res);
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const errors = Object.values(error.errors).map((err) => ({
                field: err.path,
                message: err.message,
            }));
            return next(new apiError_1.ValidationError(errors));
        }
        next(error);
    }
};
exports.signup = signup;
// Login user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // 1) Check if email and password exist
        if (!email || !password) {
            throw new apiError_1.BadRequestError('Please provide email and password');
        }
        // 2) Check if user exists && password is correct
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.correctPassword(password, user.password))) {
            throw new apiError_1.UnauthorizedError('Incorrect email or password');
        }
        // 3) Check if user is active
        if (!user.active) {
            throw new apiError_1.UnauthorizedError('This account has been deactivated');
        }
        // 4) Update login info
        user.lastLogin = new Date();
        user.loginCount += 1;
        await user.save({ validateBeforeSave: false });
        // 5) If everything ok, send token to client
        (0, token_1.createAndSendToken)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
// Logout user
const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};
exports.logout = logout;
// Protect routes - check if user is authenticated
const protect = async (req, res, next) => {
    try {
        let token;
        // 1) Get token and check if it's there
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        if (!token) {
            throw new apiError_1.UnauthorizedError('You are not logged in! Please log in to get access.');
        }
        // 2) Verification token
        const decoded = await (0, util_1.promisify)(jsonwebtoken_1.default.verify)(token, config_1.env.JWT_SECRET);
        // 3) Check if user still exists
        const currentUser = await User_1.default.findById(decoded.id);
        if (!currentUser) {
            throw new apiError_1.UnauthorizedError('The user belonging to this token no longer exists.');
        }
        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            throw new apiError_1.UnauthorizedError('User recently changed password! Please log in again.');
        }
        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
// Restrict to certain roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array of allowed roles ['admin', 'lead-guide']
        if (!roles.includes(req.user.role)) {
            throw new ForbiddenError('You do not have permission to perform this action');
        }
        next();
    };
};
exports.restrictTo = restrictTo;
// Forgot password
const forgotPassword = async (req, res, next) => {
    try {
        // 1) Get user based on POSTed email
        const user = await User_1.default.findOne({ email: req.body.email });
        if (!user) {
            throw new apiError_1.NotFoundError('There is no user with that email address.');
        }
        // 2) Generate the random reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        // 3) Send it to user's email
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
        try {
            await new email_1.default(user, resetURL).sendPasswordReset();
            res.status(200).json({
                status: 'success',
                message: 'Token sent to email!',
            });
        }
        catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            logger_1.default.error(`Error sending password reset email: ${err}`);
            throw new Error('There was an error sending the email. Try again later!');
        }
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = async (req, res, next) => {
    try {
        // 1) Get user based on the token
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');
        const user = await User_1.default.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });
        // 2) If token has not expired, and there is user, set the new password
        if (!user) {
            throw new apiError_1.BadRequestError('Token is invalid or has expired');
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        // 3) Update changedPasswordAt property for the user
        // This is handled by a pre-save middleware in the User model
        // 4) Log the user in, send JWT
        (0, token_1.createAndSendToken)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
// Update password
const updatePassword = async (req, res, next) => {
    try {
        // 1) Get user from collection
        const user = await User_1.default.findById(req.user.id).select('+password');
        if (!user) {
            throw new apiError_1.UnauthorizedError('User not found');
        }
        // 2) Check if POSTed current password is correct
        if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
            throw new apiError_1.UnauthorizedError('Your current password is wrong');
        }
        // 3) If so, update password
        user.password = req.body.newPassword;
        user.passwordConfirm = req.body.newPasswordConfirm;
        await user.save();
        // 4) Log user in, send JWT
        (0, token_1.createAndSendToken)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.updatePassword = updatePassword;
// Verify email
const verifyEmail = async (req, res, next) => {
    try {
        // 1) Get user based on the token
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');
        const user = await User_1.default.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
        });
        if (!user) {
            throw new apiError_1.BadRequestError('Token is invalid or has expired');
        }
        // 2) Update user document
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });
        // 3) Log the user in, send JWT
        (0, token_1.createAndSendToken)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
// Resend verification email
const resendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        // 1) Find user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            throw new apiError_1.NotFoundError('User not found');
        }
        if (user.emailVerified) {
            throw new apiError_1.BadRequestError('Email already verified');
        }
        // 2) Generate new verification token
        const verificationToken = user.createEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        // 3) Send verification email
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
        try {
            await new email_1.default(user, verificationUrl).sendEmailVerification();
            res.status(200).json({
                status: 'success',
                message: 'Verification email sent!',
            });
        }
        catch (err) {
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save({ validateBeforeSave: false });
            logger_1.default.error(`Error sending verification email: ${err}`);
            throw new Error('There was an error sending the email. Try again later!');
        }
    }
    catch (error) {
        next(error);
    }
};
exports.resendVerificationEmail = resendVerificationEmail;
