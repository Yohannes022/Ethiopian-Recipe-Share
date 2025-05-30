"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikeReview = exports.likeReview = exports.getReviewsByRestaurant = exports.deleteReview = exports.updateReview = exports.getReview = exports.createReview = exports.getReviewsByUser = exports.getAllReviews = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Review_1 = __importDefault(require("@/models/Review"));
const Restaurant_1 = __importDefault(require("@/models/Restaurant"));
const apiError_1 = require("@/utils/apiError");
// Get all reviews with filters
const getAllReviews = async (req, res, next) => {
    try {
        // Extract query parameters
        const { restaurant, user, minRating, maxRating, sort, page = 1, limit = 10, } = req.query;
        // Build query
        const query = {};
        if (restaurant)
            query.restaurant = restaurant;
        if (user)
            query.user = user;
        if (minRating)
            query.rating = { $gte: Number(minRating) };
        if (maxRating)
            query.rating = { $lte: Number(maxRating) };
        // Build sort
        const sortOptions = {};
        if (sort === 'rating')
            sortOptions.rating = -1;
        else if (sort === '-rating')
            sortOptions.rating = 1;
        else if (sort === 'likes')
            sortOptions.likes = -1;
        else
            sortOptions.createdAt = -1;
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get total count
        const total = await Review_1.default.countDocuments(query);
        // Get reviews
        const reviews = await Review_1.default.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .populate('user', 'name photo')
            .populate('restaurant', 'name image');
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: reviews,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllReviews = getAllReviews;
// Get reviews by user
const getReviewsByUser = async (req, res, next) => {
    try {
        const reviews = await Review_1.default.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'name photo')
            .populate('restaurant', 'name image');
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: reviews,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviewsByUser = getReviewsByUser;
// Create new review
const createReview = async (req, res, next) => {
    try {
        const { restaurant, rating, comment } = req.body;
        const userId = req.user._id;
        // Check if user has already reviewed this restaurant
        const existingReview = await Review_1.default.findOne({
            user: userId,
            restaurant,
        });
        if (existingReview) {
            return next(new apiError_1.BadRequestError('You have already reviewed this restaurant'));
        }
        const review = await Review_1.default.create({
            user: userId,
            restaurant,
            rating,
            comment,
        });
        // Populate user and restaurant details
        await review.populate('user', 'name photo');
        await review.populate('restaurant', 'name image');
        // Update restaurant's rating
        await updateRestaurantRating(new mongoose_1.default.Types.ObjectId(restaurant));
        res.status(201).json({
            status: 'success',
            data: review,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
// Get review by ID
const getReview = async (req, res, next) => {
    try {
        const review = await Review_1.default.findById(req.params.id)
            .populate('user', 'name photo')
            .populate('restaurant', 'name image');
        if (!review) {
            throw new apiError_1.NotFoundError('Review not found');
        }
        res.status(200).json({
            status: 'success',
            data: review,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReview = getReview;
// Update review
const updateReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user._id;
        const userRole = req.user.role;
        const review = await Review_1.default.findById(req.params.id);
        if (!review) {
            return next(new apiError_1.NotFoundError('Review not found'));
        }
        // Check if user is the author or admin
        if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
            return next(new apiError_1.ForbiddenError('You are not authorized to update this review'));
        }
        // Update review
        if (rating !== undefined)
            review.rating = rating;
        if (comment !== undefined)
            review.comment = comment;
        await review.save();
        // Update restaurant's rating
        await updateRestaurantRating(new mongoose_1.default.Types.ObjectId(review.restaurant.toString()));
        // Populate user and restaurant details
        await review.populate('user', 'name photo');
        await review.populate('restaurant', 'name image');
        res.status(200).json({
            status: 'success',
            data: review,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateReview = updateReview;
// Delete review
const deleteReview = async (req, res, next) => {
    try {
        const review = await Review_1.default.findById(req.params.id);
        const userId = req.user._id;
        const userRole = req.user.role;
        if (!review) {
            return next(new apiError_1.NotFoundError('Review not found'));
        }
        // Check if user is the author or admin
        if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
            return next(new apiError_1.ForbiddenError('You are not authorized to delete this review'));
        }
        const restaurantId = new mongoose_1.default.Types.ObjectId(review.restaurant.toString());
        await review.deleteOne();
        // Update restaurant's rating
        await updateRestaurantRating(restaurantId);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteReview = deleteReview;
// Get reviews by restaurant
const getReviewsByRestaurant = async (req, res, next) => {
    try {
        const reviews = await Review_1.default.find({ restaurant: req.params.restaurantId })
            .sort({ createdAt: -1 })
            .populate('user', 'name photo')
            .populate('restaurant', 'name image');
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: reviews,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviewsByRestaurant = getReviewsByRestaurant;
// Helper function to update restaurant's rating
const updateRestaurantRating = async (restaurantId) => {
    const reviews = await Review_1.default.find({ restaurant: restaurantId });
    if (reviews.length === 0)
        return;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    await Restaurant_1.default.findByIdAndUpdate(restaurantId, {
        rating: averageRating,
        reviewCount: reviews.length,
    });
};
// Like a review
const likeReview = async (req, res, next) => {
    try {
        const review = await Review_1.default.findById(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user._id);
        if (!review) {
            return next(new apiError_1.NotFoundError('Review not found'));
        }
        // Check if user has already liked the review
        const hasLiked = review.likes.some(id => id.toString() === userId.toString());
        if (hasLiked) {
            return next(new apiError_1.BadRequestError('You have already liked this review'));
        }
        // Add like
        review.likes.push(userId);
        await review.save();
        res.status(200).json({
            status: 'success',
            data: {
                likes: review.likes,
                likesCount: review.likes.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.likeReview = likeReview;
// Unlike a review
const unlikeReview = async (req, res, next) => {
    try {
        const review = await Review_1.default.findById(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user._id);
        if (!review) {
            return next(new apiError_1.NotFoundError('Review not found'));
        }
        // Check if user has liked the review
        const hasLiked = review.likes.some(id => id.toString() === userId.toString());
        if (!hasLiked) {
            return next(new apiError_1.BadRequestError('You have not liked this review'));
        }
        // Remove like
        review.likes = review.likes.filter(id => id.toString() !== userId.toString());
        await review.save();
        res.status(200).json({
            status: 'success',
            data: {
                likes: review.likes,
                likesCount: review.likes.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.unlikeReview = unlikeReview;
