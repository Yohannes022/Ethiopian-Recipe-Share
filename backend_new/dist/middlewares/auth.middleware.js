"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("@/models/user.model"));
const appError_1 = __importDefault(require("@/utils/appError"));
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new appError_1.default('You are not logged in! Please log in to get access.', 401));
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const currentUser = await user_model_1.default.findById(decoded.id);
        if (!currentUser) {
            return next(new appError_1.default('The user belonging to this token no longer exists', 401));
        }
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new appError_1.default('User recently changed password! Please log in again', 401));
        }
        const userObj = currentUser.toObject();
        const userForRequest = {
            _id: userObj._id,
            name: userObj.name,
            email: userObj.email,
            role: userObj.role,
            isEmailVerified: userObj.isEmailVerified,
            favorites: userObj.favorites || [],
            followers: userObj.followers || [],
            following: userObj.following || [],
            createdAt: userObj.createdAt,
            updatedAt: userObj.updatedAt,
            ...(userObj.profilePicture && { profilePicture: userObj.profilePicture }),
            ...(userObj.phoneNumber && { phoneNumber: userObj.phoneNumber }),
            ...(userObj.address && { address: userObj.address }),
            ...(userObj.passwordChangedAt && { passwordChangedAt: userObj.passwordChangedAt })
        };
        req.user = userForRequest;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new appError_1.default('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=auth.middleware.js.map