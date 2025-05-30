"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokenExpiration = exports.getRefreshTokenFromRequest = exports.getTokenFromRequest = exports.verifyRefreshToken = exports.verifyToken = exports.createAndSendToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("@/config/config");
// Type assertion for JWT environment variables
const jwtConfig = {
    JWT_SECRET: config_1.env.JWT_SECRET,
    JWT_EXPIRES_IN: config_1.env.JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET: config_1.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: config_1.env.JWT_REFRESH_EXPIRES_IN,
    JWT_COOKIE_EXPIRES_IN: config_1.env.JWT_COOKIE_EXPIRES_IN,
};
// Validate configuration
if (!jwtConfig.JWT_SECRET || !jwtConfig.JWT_EXPIRES_IN || !jwtConfig.JWT_REFRESH_SECRET || !jwtConfig.JWT_REFRESH_EXPIRES_IN || !jwtConfig.JWT_COOKIE_EXPIRES_IN) {
    throw new Error('JWT configuration is missing required environment variables');
}
// Sign JWT token
const signToken = (id) => {
    if (!jwtConfig.JWT_SECRET || !jwtConfig.JWT_EXPIRES_IN) {
        throw new Error('JWT configuration is missing required environment variables');
    }
    const options = {
        expiresIn: jwtConfig.JWT_EXPIRES_IN,
    };
    return jsonwebtoken_1.default.sign({ id }, jwtConfig.JWT_SECRET, options);
};
// Sign refresh token
const signRefreshToken = (id) => {
    if (!jwtConfig.JWT_REFRESH_SECRET || !jwtConfig.JWT_REFRESH_EXPIRES_IN) {
        throw new Error('JWT refresh token configuration is missing required environment variables');
    }
    const options = {
        expiresIn: jwtConfig.JWT_REFRESH_EXPIRES_IN,
    };
    return jsonwebtoken_1.default.sign({ id }, jwtConfig.JWT_REFRESH_SECRET, options);
};
// Create and send token, create cookie and send response
const createAndSendToken = (user, statusCode, res) => {
    // Ensure user._id is converted to string if it's an ObjectId
    const userId = user._id.toString();
    const token = signToken(userId);
    const refreshToken = signRefreshToken(userId);
    // Remove password from output
    user.password = undefined;
    // Cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + Number(config_1.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: config_1.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'lax', // Protection against CSRF attacks
    };
    // Set cookie
    res.cookie('jwt', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        httpOnly: true,
        path: '/api/v1/auth/refresh-token',
    });
    // Send response with user data and tokens
    res.status(statusCode).json({
        status: 'success',
        token,
        refreshToken,
        data: {
            user,
        },
    });
};
exports.createAndSendToken = createAndSendToken;
// Verify JWT token
const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, jwtConfig.JWT_SECRET, (err, decoded) => {
            if (err)
                return reject(err);
            resolve(decoded);
        });
    });
};
exports.verifyToken = verifyToken;
// Verify refresh token
const verifyRefreshToken = (token) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, jwtConfig.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err)
                return reject(err);
            resolve(decoded);
        });
    });
};
exports.verifyRefreshToken = verifyRefreshToken;
// Get token from header or cookie
const getTokenFromRequest = (req) => {
    let token;
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookie
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    return token || null;
};
exports.getTokenFromRequest = getTokenFromRequest;
// Get refresh token from header or cookie
const getRefreshTokenFromRequest = (req) => {
    let refreshToken;
    // Get refresh token from header
    if (req.headers['x-refresh-token']) {
        refreshToken = req.headers['x-refresh-token'];
    }
    // Get refresh token from cookie
    else if (req.cookies.refreshToken) {
        refreshToken = req.cookies.refreshToken;
    }
    return refreshToken || null;
};
exports.getRefreshTokenFromRequest = getRefreshTokenFromRequest;
// Generate token expiration date
const generateTokenExpiration = (days = 30) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};
exports.generateTokenExpiration = generateTokenExpiration;
