"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuth = exports.isLoggedIn = exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("@/models/User"));
const apiError_1 = require("@/utils/apiError");
const logger_1 = __importDefault(require("@/utils/logger"));
const util_1 = require("util");
const config_1 = require("@/config/config");
/**
 * Protect routes - require authentication
 */
const protect = async (req, res, next) => {
    try {
        let token;
        // 1) Get token from header
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.jwt) {
            // 2) Or get token from cookie
            token = req.cookies.jwt;
        }
        if (!token) {
            return next(new apiError_1.UnauthorizedError('You are not logged in! Please log in to get access.'));
        }
        // 2) Verify token
        const verifyAsync = (0, util_1.promisify)(jsonwebtoken_1.default.verify);
        const decoded = await verifyAsync(token, config_1.env.JWT_SECRET, {});
        // 3) Check if user still exists
        const currentUser = await User_1.default.findById(decoded.id);
        if (!currentUser) {
            return next(new apiError_1.UnauthorizedError('The user belonging to this token no longer exists.'));
        }
        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new apiError_1.UnauthorizedError('User recently changed password! Please log in again.'));
        }
        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    }
    catch (error) {
        logger_1.default.error(`Authentication error: ${error}`);
        return next(new apiError_1.UnauthorizedError('Invalid or expired token. Please log in again.'));
    }
};
exports.protect = protect;
/**
 * Restrict routes to specific roles
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'owner']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(new apiError_1.ForbiddenError('You do not have permission to perform this action'));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
/**
 * Only for rendered pages, no errors!
 */
const isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) Verify token
            const verifyAsync = (0, util_1.promisify)(jsonwebtoken_1.default.verify);
            const decoded = await verifyAsync(req.cookies.jwt, config_1.env.JWT_SECRET, {});
            // 2) Check if user still exists
            const currentUser = await User_1.default.findById(decoded.id);
            if (!currentUser) {
                return next();
            }
            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }
            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        }
        catch (err) {
            return next();
        }
    }
    next();
};
exports.isLoggedIn = isLoggedIn;
/**
 * Check if user is authenticated for socket connections
 */
const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next({
                message: 'Authentication error: No token provided',
                code: 401
            });
        }
        const verifyAsync = (0, util_1.promisify)(jsonwebtoken_1.default.verify);
        const decoded = await verifyAsync(token, config_1.env.JWT_SECRET, {});
        const currentUser = await User_1.default.findById(decoded.id);
        if (!currentUser) {
            return next({
                message: 'Authentication error: User not found',
                code: 401
            });
        }
        // Attach user to socket for later use
        socket.user = currentUser;
        next();
    }
    catch (error) {
        logger_1.default.error(`Socket authentication error: ${error}`);
        next({
            message: 'Authentication error',
            code: 401
        });
    }
};
exports.socketAuth = socketAuth;
