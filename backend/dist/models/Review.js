"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
    },
    restaurant: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'Review must belong to a restaurant'],
    },
    rating: {
        type: Number,
        required: [true, 'Review must have a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
        type: String,
        required: [true, 'Review must have a comment'],
        trim: true,
    },
    images: [{
            type: String,
            trim: true,
        }],
    likes: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes
reviewSchema.index({ user: 1, restaurant: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
// Virtual populate
reviewSchema.virtual('user', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true,
    select: 'name photo',
});
reviewSchema.virtual('restaurant', {
    ref: 'Restaurant',
    localField: 'restaurant',
    foreignField: '_id',
    justOne: true,
    select: 'name image',
});
// Instance methods
reviewSchema.methods.updateRating = function (newRating) {
    this.rating = newRating;
};
reviewSchema.methods.addLike = function (userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
    }
};
reviewSchema.methods.removeLike = function (userId) {
    this.likes = this.likes.filter((like) => !like.equals(userId));
};
// Create and export the model
const Review = mongoose_1.default.model('Review', reviewSchema);
exports.default = Review;
