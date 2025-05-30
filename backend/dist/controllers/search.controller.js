"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedSearch = exports.search = void 0;
const Recipe_1 = require("@/models/Recipe");
const Restaurant_1 = __importDefault(require("@/models/Restaurant"));
const User_1 = __importDefault(require("@/models/User"));
const apiError_1 = require("@/utils/apiError");
// Global search across recipes, restaurants, and users
const search = async (req, res, next) => {
    try {
        const { query, type, page = 1, limit = 10 } = req.query;
        if (!query) {
            throw new apiError_1.BadRequestError('Search query is required');
        }
        const skip = (Number(page) - 1) * Number(limit);
        // Build search query
        const searchQuery = {
            $text: { $search: query.toString() },
        };
        // Search across all types if no type specified
        let results = [];
        if (!type || type === 'recipe') {
            const recipes = await Recipe_1.Recipe.find(searchQuery)
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(Number(limit))
                .select('name description image rating category')
                .populate('category', 'name')
                .lean();
            results = [...results, ...recipes.map((recipe) => ({
                    type: 'recipe',
                    _id: recipe._id?.toString() || '',
                    name: recipe.name,
                    description: recipe.description,
                    image: recipe.image,
                    rating: recipe.rating,
                    category: recipe.category?.name,
                }))];
        }
        if (!type || type === 'restaurant') {
            const restaurants = await Restaurant_1.default.find(searchQuery)
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(Number(limit))
                .select('name description image rating')
                .lean();
            results = [...results, ...restaurants.map((restaurant) => ({
                    type: 'restaurant',
                    _id: restaurant._id?.toString() || '',
                    name: restaurant.name,
                    description: restaurant.description,
                    image: restaurant.image,
                    rating: restaurant.rating,
                }))];
        }
        if (!type || type === 'user') {
            const users = await User_1.default.find(searchQuery)
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(Number(limit))
                .select('name bio photo')
                .lean();
            results = [...results, ...users.map((user) => ({
                    type: 'user',
                    _id: user._id?.toString() || '',
                    name: user.name,
                    description: user.bio,
                    image: user.photo,
                }))];
        }
        // Get total count
        const total = await Promise.all([
            !type || type === 'recipe' ? Recipe_1.Recipe.countDocuments(searchQuery) : 0,
            !type || type === 'restaurant' ? Restaurant_1.default.countDocuments(searchQuery) : 0,
            !type || type === 'user' ? User_1.default.countDocuments(searchQuery) : 0,
        ]).then((counts) => counts.reduce((sum, count) => sum + count, 0));
        res.status(200).json({
            status: 'success',
            results: results.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: results,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.search = search;
// Advanced search with filters
const advancedSearch = async (req, res, next) => {
    try {
        const { type, category, minRating, maxRating, location, sort, page = 1, limit = 10, } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Build query based on type
        let query = {};
        let model;
        switch (type) {
            case 'recipe':
                model = Recipe_1.Recipe;
                if (category)
                    query.category = category;
                if (minRating)
                    query.rating = { $gte: Number(minRating) };
                if (maxRating)
                    query.rating = { $lte: Number(maxRating) };
                break;
            case 'restaurant':
                model = Restaurant_1.default;
                if (category)
                    query.categories = category;
                if (minRating)
                    query.rating = { $gte: Number(minRating) };
                if (maxRating)
                    query.rating = { $lte: Number(maxRating) };
                if (location) {
                    const [lat, lng] = location.toString().split(',').map(Number);
                    query.location = {
                        $near: {
                            $geometry: { type: 'Point', coordinates: [lng, lat] },
                            $maxDistance: 5000, // 5km radius
                        },
                    };
                }
                break;
            case 'user':
                model = User_1.default;
                break;
            default:
                throw new apiError_1.BadRequestError('Invalid search type');
        }
        // Build sort options
        const sortOptions = {};
        if (sort === 'rating')
            sortOptions.rating = -1;
        else if (sort === 'name')
            sortOptions.name = 1;
        else if (sort === 'distance' && type === 'restaurant') {
            sortOptions.location = 1;
        }
        // Execute search
        const [results, total] = await Promise.all([
            model.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit)),
            model.countDocuments(query),
        ]);
        res.status(200).json({
            status: 'success',
            results: results.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: results,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.advancedSearch = advancedSearch;
