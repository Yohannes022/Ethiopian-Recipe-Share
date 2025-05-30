"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavoritesByType = exports.getAllFavorites = exports.isItemFavorited = exports.getFavoritesByTypeByUser = exports.deleteFavorite = exports.createFavorite = exports.getAllFavoritesByUser = void 0;
const Favorite_1 = __importDefault(require("@/models/Favorite"));
const apiError_1 = require("@/utils/apiError");
// Get all favorites with filters
const getAllFavoritesByUser = async (req, res, next) => {
    try {
        // Extract query parameters
        const { type, sort, page = 1, limit = 10, } = req.query;
        // Build query
        const query = { user: req.user._id };
        if (type)
            query.type = type;
        // Build sort
        const sortOptions = {};
        if (sort === 'type')
            sortOptions.type = 1;
        else if (sort === '-type')
            sortOptions.type = -1;
        else
            sortOptions.createdAt = -1;
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get total count
        const total = await Favorite_1.default.countDocuments(query);
        // Get favorites
        const favorites = await Favorite_1.default.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .populate('user', 'name photo')
            .populate('item', '_id name image');
        res.status(200).json({
            status: 'success',
            results: favorites.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: favorites,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllFavoritesByUser = getAllFavoritesByUser;
// Create favorite
const createFavorite = async (req, res, next) => {
    try {
        // Check if user has already favorited this item
        const existingFavorite = await Favorite_1.default.findOne({
            user: req.user._id,
            type: req.body.type,
            itemId: req.body.itemId,
        });
        if (existingFavorite) {
            throw new apiError_1.BadRequestError('You have already favorited this item');
        }
        // Create favorite
        const favorite = await Favorite_1.default.create({
            ...req.body,
            user: req.user._id,
        });
        res.status(201).json({
            status: 'success',
            data: favorite,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createFavorite = createFavorite;
// Delete favorite
const deleteFavorite = async (req, res, next) => {
    try {
        const favorite = await Favorite_1.default.findById(req.params.id);
        if (!favorite) {
            throw new apiError_1.NotFoundError('Favorite not found');
        }
        // Check if favorite belongs to user
        if (!favorite.user.equals(req.user._id)) {
            throw new apiError_1.BadRequestError('You do not have permission to delete this favorite');
        }
        await Favorite_1.default.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFavorite = deleteFavorite;
// Get favorites by type
const getFavoritesByTypeByUser = async (req, res, next) => {
    try {
        const favorites = await Favorite_1.default.find({
            user: req.user._id,
            type: req.params.type,
        })
            .sort({ createdAt: -1 })
            .populate('user', 'name photo')
            .populate('item', '_id name image');
        res.status(200).json({
            status: 'success',
            results: favorites.length,
            data: favorites,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFavoritesByTypeByUser = getFavoritesByTypeByUser;
// Check if item is favorited
const isItemFavorited = async (req, res, next) => {
    try {
        const favorite = await Favorite_1.default.findOne({
            user: req.user._id,
            type: req.params.type,
            itemId: req.params.itemId,
        });
        res.status(200).json({
            status: 'success',
            data: { favorited: !!favorite },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.isItemFavorited = isItemFavorited;
// Get all favorites
const getAllFavorites = async (req, res, next) => {
    try {
        const favorites = await Favorite_1.default.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'name photo')
            .populate('item', '_id name image');
        res.status(200).json({
            status: 'success',
            results: favorites.length,
            data: favorites,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllFavorites = getAllFavorites;
// Get favorites by type
const getFavoritesByType = async (req, res, next) => {
    try {
        const favorites = await Favorite_1.default.find({
            user: req.user._id,
            type: req.params.type,
        })
            .sort({ createdAt: -1 })
            .populate('user', 'name photo')
            .populate('item', '_id name image');
        res.status(200).json({
            status: 'success',
            results: favorites.length,
            data: favorites,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFavoritesByType = getFavoritesByType;
