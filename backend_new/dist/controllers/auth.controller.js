"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const user_model_1 = __importDefault(require("@/models/user.model"));
const jwt_1 = require("@/utils/jwt");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
const register = async (req, res, next) => {
    try {
        const { name, email, password, passwordConfirm } = req.body;
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already in use', 400));
        }
        const newUser = await user_model_1.default.create({
            name,
            email,
            password,
            role: 'user',
        });
        (0, jwt_1.createSendToken)(newUser, 201, res);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }
        const user = await user_model_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError('Incorrect email or password', 401));
        }
        (0, jwt_1.createSendToken)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        const user = await user_model_1.default.findById(req.user?.id);
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map