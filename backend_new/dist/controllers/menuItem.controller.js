"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenuItemsByRestaurant = exports.deleteMenuItem = exports.updateMenuItem = exports.getMenuItem = exports.createMenuItem = exports.getAllMenuItems = void 0;
const menuItem_model_1 = __importDefault(require("@/models/menuItem.model"));
const restaurant_model_1 = __importDefault(require("@/models/restaurant.model"));
const appError_1 = __importDefault(require("@/utils/appError"));
const checkRestaurantOwnership = async (req, next) => {
    const restaurant = await restaurant_model_1.default.findById(req.params.restaurantId || req.body.restaurant);
    if (!restaurant) {
        return next(new appError_1.default('No restaurant found with that ID', 404));
    }
    if (!req.user) {
        return next(new appError_1.default('You must be logged in to perform this action', 401));
    }
    const user = req.user;
    if (restaurant.owner.toString() !== user._id.toString() && user.role !== 'admin') {
        return next(new appError_1.default('You do not have permission to perform this action', 403));
    }
    return restaurant;
};
const getAllMenuItems = async (req, res, next) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        const filteredQuery = Object.fromEntries(Object.entries(queryObj).filter(([key]) => !excludedFields.includes(key)));
        let queryStr = JSON.stringify(filteredQuery);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        const filter = JSON.parse(queryStr);
        let query = menuItem_model_1.default.find(filter);
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else {
            query = query.sort('-createdAt');
        }
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }
        else {
            query = query.select('-__v');
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        const menuItems = await query.lean().exec();
        if (!menuItems) {
            return next(new appError_1.default('No menu items found', 404));
        }
        res.status(200).json({
            status: 'success',
            results: menuItems.length,
            data: {
                menuItems
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllMenuItems = getAllMenuItems;
const createMenuItem = async (req, res, next) => {
    try {
        const restaurant = await checkRestaurantOwnership(req, next);
        if (restaurant instanceof appError_1.default)
            return next(restaurant);
        if (!req.body.restaurant) {
            req.body.restaurant = req.params.restaurantId;
        }
        const newMenuItem = await menuItem_model_1.default.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                menuItem: newMenuItem
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createMenuItem = createMenuItem;
const getMenuItem = async (req, res, next) => {
    try {
        const menuItem = await menuItem_model_1.default.findById(req.params.id).populate('restaurant', 'name');
        if (!menuItem) {
            return next(new appError_1.default('No menu item found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                menuItem
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMenuItem = getMenuItem;
const updateMenuItem = async (req, res, next) => {
    try {
        const menuItem = await menuItem_model_1.default.findById(req.params.id);
        if (!menuItem) {
            return next(new appError_1.default('No menu item found with that ID', 404));
        }
        req.params.restaurantId = menuItem.restaurant.toString();
        const restaurant = await checkRestaurantOwnership(req, next);
        if (restaurant instanceof appError_1.default)
            return next(restaurant);
        const updatedMenuItem = await menuItem_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: 'success',
            data: {
                menuItem: updatedMenuItem
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMenuItem = updateMenuItem;
const deleteMenuItem = async (req, res, next) => {
    try {
        const menuItem = await menuItem_model_1.default.findById(req.params.id);
        if (!menuItem) {
            return next(new appError_1.default('No menu item found with that ID', 404));
        }
        req.params.restaurantId = menuItem.restaurant.toString();
        const restaurant = await checkRestaurantOwnership(req, next);
        if (restaurant instanceof appError_1.default)
            return next(restaurant);
        await menuItem_model_1.default.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMenuItem = deleteMenuItem;
const getMenuItemsByRestaurant = async (req, res, next) => {
    try {
        const restaurant = await restaurant_model_1.default.findById(req.params.restaurantId);
        if (!restaurant) {
            return next(new appError_1.default('No restaurant found with that ID', 404));
        }
        const menuItems = await menuItem_model_1.default.find({ restaurant: req.params.restaurantId })
            .lean()
            .exec();
        if (!menuItems) {
            return next(new appError_1.default('No menu items found for this restaurant', 404));
        }
        res.status(200).json({
            status: 'success',
            results: menuItems.length,
            data: {
                menuItems
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMenuItemsByRestaurant = getMenuItemsByRestaurant;
//# sourceMappingURL=menuItem.controller.js.map