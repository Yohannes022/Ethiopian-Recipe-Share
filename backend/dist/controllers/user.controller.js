"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewsByUser = exports.deleteMe = exports.updateMe = exports.getMe = exports.deleteUser = exports.updateUser = exports.getUser = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("@/models/User"));
const Review_1 = __importDefault(require("@/models/Review"));
const apiError_1 = require("@/utils/apiError");
// Get all users (admin only)
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User_1.default.find().select('-password -__v');
        res.status(200).json({
            status: 'success',
            data: {
                users,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
// Get specific user (admin only)
const getUser = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password -__v');
        if (!user) {
            throw new apiError_1.NotFoundError('User not found');
        }
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
exports.getUser = getUser;
// Update user (admin only)
const updateUser = async (req, res, next) => {
    try {
        const user = await User_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).select('-password -__v');
        if (!user) {
            throw new apiError_1.NotFoundError('User not found');
        }
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
exports.updateUser = updateUser;
// Delete user (admin only)
const deleteUser = async (req, res, next) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            throw new apiError_1.NotFoundError('User not found');
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
// Get current user's profile
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user.id).select('-password -__v');
        if (!user) {
            throw new apiError_1.NotFoundError('User not found');
        }
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
// Update current user's profile
const updateMe = async (req, res, next) => {
    try {
        // Create a type for allowed update fields
        const allowedFields = ['name', 'email', 'photo', 'bio', 'phoneNumber'];
        const filteredBody = {};
        Object.entries(req.body).forEach(([key, value]) => {
            if (allowedFields.includes(key)) {
                filteredBody[key] = value;
            }
        });
        const user = await User_1.default.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true,
        }).select('-password -__v');
        if (!user) {
            throw new apiError_1.NotFoundError('User not found');
        }
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
exports.updateMe = updateMe;
// Delete current user's profile
const deleteMe = async (req, res, next) => {
    try {
        await User_1.default.findByIdAndUpdate(req.user.id, { active: false });
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMe = deleteMe;
// Get user's reviews
const getReviewsByUser = async (req, res, next) => {
    try {
        const reviews = await Review_1.default.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('restaurant', 'name image')
            .populate('user', 'name photo');
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: {
                reviews,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviewsByUser = getReviewsByUser;
