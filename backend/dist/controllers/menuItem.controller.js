"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenuItemsByRestaurant = exports.deleteMenuItem = exports.updateMenuItem = exports.getMenuItem = exports.createMenuItem = exports.getAllMenuItems = void 0;
const MenuItem_1 = __importDefault(require("@/models/MenuItem"));
const apiError_1 = require("@/utils/apiError");
const Restaurant_1 = __importDefault(require("@/models/Restaurant"));
// Get all menu items with filters
const getAllMenuItems = async (req, res, next) => {
    try {
        // Extract query parameters
        const { name, category, minPrice, maxPrice, restaurant, sort, page = 1, limit = 10, } = req.query;
        // Build query
        const query = {};
        if (name)
            query.name = { $regex: name, $options: 'i' };
        if (category)
            query.category = category;
        if (minPrice)
            query.price = { $gte: Number(minPrice) };
        if (maxPrice)
            query.price = { $lte: Number(maxPrice) };
        if (restaurant)
            query.restaurant = restaurant;
        // Build sort
        const sortOptions = {};
        if (sort === 'price')
            sortOptions.price = 1;
        else if (sort === '-price')
            sortOptions.price = -1;
        else if (sort === 'name')
            sortOptions.name = 1;
        else
            sortOptions.createdAt = -1;
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get total count
        const total = await MenuItem_1.default.countDocuments(query);
        // Get menu items
        const menuItems = await MenuItem_1.default.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .populate('restaurant', 'name');
        res.status(200).json({
            status: 'success',
            results: menuItems.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: menuItems,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllMenuItems = getAllMenuItems;
// Create new menu item
const createMenuItem = async (req, res, next) => {
    try {
        // Check if user is restaurant owner
        const restaurant = await Restaurant_1.default.findById(req.body.restaurant);
        if (!restaurant) {
            throw new apiError_1.NotFoundError('Restaurant not found');
        }
        if (!restaurant.owner.equals(req.user._id)) {
            throw new apiError_1.BadRequestError('You do not have permission to create menu items for this restaurant');
        }
        const menuItem = await MenuItem_1.default.create(req.body);
        // Add menu item to restaurant
        await Restaurant_1.default.findByIdAndUpdate(req.body.restaurant, { $push: { menu: menuItem._id } });
        res.status(201).json({
            status: 'success',
            data: menuItem,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createMenuItem = createMenuItem;
// Get menu item by ID
const getMenuItem = async (req, res, next) => {
    try {
        const menuItem = await MenuItem_1.default.findById(req.params.id)
            .populate('restaurant', 'name');
        if (!menuItem) {
            throw new apiError_1.NotFoundError('Menu item not found');
        }
        res.status(200).json({
            status: 'success',
            data: menuItem,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMenuItem = getMenuItem;
// Update menu item
const updateMenuItem = async (req, res, next) => {
    try {
        const menuItem = await MenuItem_1.default.findById(req.params.id);
        if (!menuItem) {
            throw new apiError_1.NotFoundError('Menu item not found');
        }
        // Check if user is owner of the restaurant
        const restaurant = await Restaurant_1.default.findById(menuItem.restaurant);
        if (!restaurant || !restaurant.owner.equals(req.user._id)) {
            throw new apiError_1.BadRequestError('You do not have permission to update this menu item');
        }
        // Update menu item
        const updatedMenuItem = await MenuItem_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('restaurant', 'name');
        res.status(200).json({
            status: 'success',
            data: updatedMenuItem,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMenuItem = updateMenuItem;
// Delete menu item
const deleteMenuItem = async (req, res, next) => {
    try {
        const menuItem = await MenuItem_1.default.findById(req.params.id);
        if (!menuItem) {
            throw new apiError_1.NotFoundError('Menu item not found');
        }
        // Check if user is owner of the restaurant
        const restaurant = await Restaurant_1.default.findById(menuItem.restaurant);
        if (!restaurant || !restaurant.owner.equals(req.user._id)) {
            throw new apiError_1.BadRequestError('You do not have permission to delete this menu item');
        }
        // Remove menu item from restaurant
        await Restaurant_1.default.findByIdAndUpdate(menuItem.restaurant, { $pull: { menu: menuItem._id } });
        await menuItem.deleteOne();
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMenuItem = deleteMenuItem;
// Get menu items by restaurant
const getMenuItemsByRestaurant = async (req, res, next) => {
    try {
        const menuItems = await MenuItem_1.default.find({ restaurant: req.params.restaurantId })
            .sort({ createdAt: -1 })
            .populate('restaurant', 'name');
        res.status(200).json({
            status: 'success',
            results: menuItems.length,
            data: menuItems,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMenuItemsByRestaurant = getMenuItemsByRestaurant;
