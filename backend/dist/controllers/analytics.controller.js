"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderAnalytics = exports.getRestaurantAnalytics = exports.getUserAnalytics = void 0;
const User_1 = __importDefault(require("@/models/User"));
const Restaurant_1 = __importDefault(require("@/models/Restaurant"));
const Order_1 = __importDefault(require("@/models/Order"));
const Review_1 = __importDefault(require("@/models/Review"));
const apiError_1 = require("@/utils/apiError");
const mongoose_1 = __importDefault(require("mongoose"));
// Get user analytics
const getUserAnalytics = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            throw new apiError_1.BadRequestError('You must be an admin to view analytics');
        }
        const [userCount, restaurantCount, orderCount, reviewCount] = await Promise.all([
            User_1.default.countDocuments(),
            Restaurant_1.default.countDocuments(),
            Order_1.default.countDocuments(),
            Review_1.default.countDocuments(),
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                totalUsers: userCount,
                totalRestaurants: restaurantCount,
                totalOrders: orderCount,
                totalReviews: reviewCount,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserAnalytics = getUserAnalytics;
// Get restaurant analytics
const getRestaurantAnalytics = async (req, res, next) => {
    try {
        // Check if user is restaurant owner
        const restaurant = await Restaurant_1.default.findById(req.params.restaurantId);
        if (!restaurant || !restaurant.owner.equals(req.user._id)) {
            throw new apiError_1.BadRequestError('You do not have permission to view these analytics');
        }
        const [orderCount, reviewCount, totalRevenue] = await Promise.all([
            Order_1.default.countDocuments({ restaurant: req.params.restaurantId }),
            Review_1.default.countDocuments({ restaurant: req.params.restaurantId }),
            Order_1.default.aggregate([
                { $match: { restaurant: new mongoose_1.default.Types.ObjectId(req.params.restaurantId) } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                totalOrders: orderCount,
                totalReviews: reviewCount,
                totalRevenue: totalRevenue[0]?.total || 0,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRestaurantAnalytics = getRestaurantAnalytics;
// Get order analytics
const getOrderAnalytics = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            throw new apiError_1.BadRequestError('You must be an admin to view analytics');
        }
        const [totalOrders, totalRevenue, orderStatus] = await Promise.all([
            Order_1.default.countDocuments(),
            Order_1.default.aggregate([
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order_1.default.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                orderStatus: orderStatus.map(status => ({
                    status: status._id,
                    count: status.count,
                })),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderAnalytics = getOrderAnalytics;
