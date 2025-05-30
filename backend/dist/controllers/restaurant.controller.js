"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestaurantMenu = exports.getRestaurantsByOwner = exports.deleteRestaurant = exports.updateRestaurant = exports.getRestaurant = exports.createRestaurant = exports.getAllRestaurants = void 0;
const Restaurant_1 = __importDefault(require("@/models/Restaurant"));
const apiError_1 = require("@/utils/apiError");
// Get all restaurants with filters
const getAllRestaurants = async (req, res, next) => {
    try {
        // Extract query parameters
        const { name, cuisine, category, minRating, maxRating, minPrice, maxPrice, sort, page = '1', limit = '10', } = req.query;
        // Build query
        const query = {};
        if (name)
            query.name = { $regex: name, $options: 'i' };
        if (cuisine)
            query.cuisine = { $in: cuisine.split(',') };
        if (category)
            query.category = category;
        if (minRating)
            query.rating = { $gte: Number(minRating) };
        if (maxRating)
            query.rating = { $lte: Number(maxRating) };
        if (minPrice)
            query.menu = { $elemMatch: { price: { $gte: Number(minPrice) } } };
        if (maxPrice)
            query.menu = { $elemMatch: { price: { $lte: Number(maxPrice) } } };
        // Build sort
        const sortOptions = {};
        if (sort === 'newest')
            sortOptions.createdAt = -1;
        else if (sort === 'oldest')
            sortOptions.createdAt = 1;
        else if (sort === 'rating')
            sortOptions.rating = -1;
        else if (sort === 'price')
            sortOptions.menu = 1;
        else
            sortOptions.createdAt = -1;
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get total count
        const total = await Restaurant_1.default.countDocuments(query);
        // Get restaurants
        const restaurants = await Restaurant_1.default.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .populate('owner', 'name photo')
            .populate('category', 'name')
            .populate('menu', 'name price category');
        res.status(200).json({
            status: 'success',
            results: restaurants.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: restaurants,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllRestaurants = getAllRestaurants;
// Create new restaurant
const createRestaurant = async (req, res, next) => {
    try {
        // Check if user is restaurant owner
        if (req.user.role !== 'restaurant_owner') {
            throw new apiError_1.BadRequestError('You must be a restaurant owner to create a restaurant');
        }
        const restaurant = await Restaurant_1.default.create({
            ...req.body,
            owner: req.user._id,
        });
        res.status(201).json({
            status: 'success',
            data: restaurant,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createRestaurant = createRestaurant;
// Get restaurant by ID
const getRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant_1.default.findById(req.params.id)
            .populate('owner', 'name photo')
            .populate('category', 'name')
            .populate('menu', 'name price category')
            .populate('reviews', 'rating comment user');
        if (!restaurant) {
            throw new apiError_1.NotFoundError('Restaurant not found');
        }
        res.status(200).json({
            status: 'success',
            data: restaurant,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRestaurant = getRestaurant;
// Update restaurant
const updateRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant_1.default.findById(req.params.id);
        if (!restaurant) {
            throw new apiError_1.NotFoundError('Restaurant not found');
        }
        // Check if user is owner or admin
        if (!restaurant.owner.equals(req.user._id) && req.user.role !== 'admin') {
            throw new apiError_1.BadRequestError('You do not have permission to update this restaurant');
        }
        // Update restaurant
        const updatedRestaurant = await Restaurant_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('owner', 'name photo').populate('category', 'name');
        res.status(200).json({
            status: 'success',
            data: updatedRestaurant,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRestaurant = updateRestaurant;
// Delete restaurant
const deleteRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant_1.default.findById(req.params.id);
        if (!restaurant) {
            throw new apiError_1.NotFoundError('Restaurant not found');
        }
        // Check if user is owner or admin
        if (!restaurant.owner.equals(req.user._id) && req.user.role !== 'admin') {
            throw new apiError_1.BadRequestError('You do not have permission to delete this restaurant');
        }
        await restaurant.deleteOne();
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRestaurant = deleteRestaurant;
// Get restaurants by owner
const getRestaurantsByOwner = async (req, res, next) => {
    try {
        const restaurants = await Restaurant_1.default.find({ owner: req.params.ownerId })
            .sort({ createdAt: -1 })
            .populate('owner', 'name photo')
            .populate('category', 'name');
        res.status(200).json({
            status: 'success',
            results: restaurants.length,
            data: restaurants,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRestaurantsByOwner = getRestaurantsByOwner;
// Get restaurant menu
const getRestaurantMenu = async (req, res, next) => {
    try {
        const restaurant = await Restaurant_1.default.findById(req.params.id)
            .populate('menu', 'name description price category image');
        if (!restaurant) {
            throw new apiError_1.NotFoundError('Restaurant not found');
        }
        res.status(200).json({
            status: 'success',
            data: restaurant.menu,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRestaurantMenu = getRestaurantMenu;
