"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRestaurantMenu = exports.getRestaurantMenu = exports.getRestaurantsByOwner = exports.deleteRestaurant = exports.updateRestaurant = exports.createRestaurant = exports.getRestaurant = exports.getAllRestaurants = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const restaurant_model_1 = __importDefault(require("../models/restaurant.model"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const buildFilter = (query) => {
    const filter = { isActive: true };
    if (query.city)
        filter['address.city'] = new RegExp(query.city, 'i');
    if (query.cuisine)
        filter.cuisineType = { $in: query.cuisine.split(',') };
    if (query.search) {
        filter.$text = { $search: query.search };
    }
    if (query.minRating) {
        filter['rating.average'] = { $gte: Number(query.minRating) };
    }
    return filter;
};
exports.getAllRestaurants = (0, catchAsync_1.default)(async (req, res, next) => {
    const filter = buildFilter(req.query);
    const sortBy = req.query.sortBy?.toString() || '-createdAt';
    const sortOptions = {};
    sortOptions[sortBy.replace(/^-/, '')] = sortBy.startsWith('-') ? 'desc' : 'asc';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [restaurants, total] = await Promise.all([
        restaurant_model_1.default.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .populate('owner', 'name email phone'),
        restaurant_model_1.default.countDocuments(filter)
    ]);
    res.status(200).json({
        status: 'success',
        results: restaurants.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: restaurants
    });
});
exports.getRestaurant = (0, catchAsync_1.default)(async (req, res, next) => {
    const restaurant = await restaurant_model_1.default.findById(req.params.id)
        .populate('owner', 'name email phone')
        .populate('reviews');
    if (!restaurant || !restaurant.isActive) {
        return next(new appError_1.default('No restaurant found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: restaurant
    });
});
exports.createRestaurant = (0, catchAsync_1.default)(async (req, res, next) => {
    if (!req.user || (req.user.role !== 'restaurant_owner' && req.user.role !== 'admin')) {
        return next(new appError_1.default('Not authorized to create a restaurant', 403));
    }
    if (!req.user) {
        return next(new appError_1.default('User not authenticated', 401));
    }
    const newRestaurant = await restaurant_model_1.default.create({
        ...req.body,
        owner: req.user._id
    });
    res.status(201).json({
        status: 'success',
        data: newRestaurant
    });
});
exports.updateRestaurant = (0, catchAsync_1.default)(async (req, res, next) => {
    const restaurant = await restaurant_model_1.default.findById(req.params.id);
    if (!restaurant) {
        return next(new appError_1.default('No restaurant found with that ID', 404));
    }
    if (!req.user) {
        return next(new appError_1.default('User not authenticated', 401));
    }
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new appError_1.default('Not authorized to update this restaurant', 403));
    }
    if (req.body.owner) {
        delete req.body.owner;
    }
    const updatedRestaurant = await restaurant_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: 'success',
        data: updatedRestaurant
    });
});
exports.deleteRestaurant = (0, catchAsync_1.default)(async (req, res, next) => {
    const restaurant = await restaurant_model_1.default.findById(req.params.id);
    if (!restaurant) {
        return next(new appError_1.default('No restaurant found with that ID', 404));
    }
    if (!req.user) {
        return next(new appError_1.default('User not authenticated', 401));
    }
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new appError_1.default('Not authorized to delete this restaurant', 403));
    }
    restaurant.isActive = false;
    await restaurant.save();
    res.status(204).json({
        status: 'success',
        data: null
    });
});
exports.getRestaurantsByOwner = (0, catchAsync_1.default)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.ownerId)) {
        return next(new appError_1.default('Invalid owner ID', 400));
    }
    const restaurants = await restaurant_model_1.default.find({
        owner: req.params.ownerId,
        isActive: true
    }).select('-menu');
    res.status(200).json({
        status: 'success',
        results: restaurants.length,
        data: restaurants
    });
});
exports.getRestaurantMenu = (0, catchAsync_1.default)(async (req, res, next) => {
    const restaurant = await restaurant_model_1.default.findById(req.params.id)
        .select('menu name');
    if (!restaurant || !restaurant.isActive) {
        return next(new appError_1.default('No restaurant found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            restaurant: restaurant.name,
            menu: restaurant.menu
        }
    });
});
exports.updateRestaurantMenu = (0, catchAsync_1.default)(async (req, res, next) => {
    const restaurant = await restaurant_model_1.default.findById(req.params.id);
    if (!restaurant) {
        return next(new appError_1.default('No restaurant found with that ID', 404));
    }
    if (!req.user) {
        return next(new appError_1.default('User not authenticated', 401));
    }
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new appError_1.default('Not authorized to update this menu', 403));
    }
    if (req.body.menu && Array.isArray(req.body.menu)) {
        restaurant.menu = req.body.menu;
        await restaurant.save();
    }
    res.status(200).json({
        status: 'success',
        data: {
            menu: restaurant.menu
        }
    });
});
//# sourceMappingURL=restaurant.controller.js.map