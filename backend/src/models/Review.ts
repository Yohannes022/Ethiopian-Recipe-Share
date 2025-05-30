import mongoose, { Schema, Document, Model } from 'mongoose';
import { IReview, IReviewMethods, ReviewModel } from '@/types/review.types';

const reviewSchema = new mongoose.Schema<IReview, ReviewModel, IReviewMethods>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

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
reviewSchema.methods.updateRating = function (newRating: number) {
  this.rating = newRating;
};

reviewSchema.methods.addLike = function (userId: mongoose.Types.ObjectId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
  }
};

reviewSchema.methods.removeLike = function (userId: mongoose.Types.ObjectId) {
  this.likes = this.likes.filter((like) => !like.equals(userId));
};

// Create and export the model
const Review = mongoose.model<IReview, ReviewModel>('Review', reviewSchema);
export default Review;
