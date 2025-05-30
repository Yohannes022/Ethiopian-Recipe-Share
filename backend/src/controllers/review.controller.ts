import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Review from '@/models/Review';
import Restaurant from '@/models/Restaurant';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/utils/apiError';
import { IReview } from '@/types/review.types';
import { protect } from '../middleware/auth';

// Get all reviews with filters
export const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract query parameters
    const {
      restaurant,
      user,
      minRating,
      maxRating,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query: any = {};

    if (restaurant) query.restaurant = restaurant;
    if (user) query.user = user;
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (maxRating) query.rating = { $lte: Number(maxRating) };

    // Build sort
    const sortOptions: any = {};
    if (sort === 'rating') sortOptions.rating = -1;
    else if (sort === '-rating') sortOptions.rating = 1;
    else if (sort === 'likes') sortOptions.likes = -1;
    else sortOptions.createdAt = -1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count
    const total = await Review.countDocuments(query);

    // Get reviews
    const reviews = await Review.find(query)
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
  } catch (error) {
    next(error);
  }
};

// Get reviews by user
export const getReviewsByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name photo')
      .populate('restaurant', 'name image');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Create new review
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { restaurant, rating, comment } = req.body;
    const userId = (req as any).user._id;

    // Check if user has already reviewed this restaurant
    const existingReview = await Review.findOne({
      user: userId,
      restaurant,
    });

    if (existingReview) {
      return next(new BadRequestError('You have already reviewed this restaurant'));
    }

    const review = await Review.create({
      user: userId,
      restaurant,
      rating,
      comment,
    });

    // Populate user and restaurant details
    await review.populate('user', 'name photo');
    await review.populate('restaurant', 'name image');

    // Update restaurant's rating
    await updateRestaurantRating(new mongoose.Types.ObjectId(restaurant));

    res.status(201).json({
      status: 'success',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// Get review by ID
export const getReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name photo')
      .populate('restaurant', 'name image');

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    res.status(200).json({
      status: 'success',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// Update review
export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rating, comment } = req.body;
    const userId = (req as any).user._id;
    const userRole = (req as any).user.role;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new NotFoundError('Review not found'));
    }

    // Check if user is the author or admin
    if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
      return next(new ForbiddenError('You are not authorized to update this review'));
    }

    // Update review
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    
    await review.save();

    // Update restaurant's rating
    await updateRestaurantRating(new mongoose.Types.ObjectId(review.restaurant.toString()));

    // Populate user and restaurant details
    await review.populate('user', 'name photo');
    await review.populate('restaurant', 'name image');

    res.status(200).json({
      status: 'success',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// Delete review
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id);
    const userId = (req as any).user._id;
    const userRole = (req as any).user.role;

    if (!review) {
      return next(new NotFoundError('Review not found'));
    }

    // Check if user is the author or admin
    if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
      return next(new ForbiddenError('You are not authorized to delete this review'));
    }

    const restaurantId = new mongoose.Types.ObjectId(review.restaurant.toString());
    await review.deleteOne();

    // Update restaurant's rating
    await updateRestaurantRating(restaurantId);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews by restaurant
export const getReviewsByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .sort({ createdAt: -1 })
      .populate('user', 'name photo')
      .populate('restaurant', 'name image');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update restaurant's rating
const updateRestaurantRating = async (restaurantId: mongoose.Types.ObjectId) => {
  const reviews = await Review.find({ restaurant: restaurantId });
  if (reviews.length === 0) return;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Restaurant.findByIdAndUpdate(restaurantId, {
    rating: averageRating,
    reviewCount: reviews.length,
  });
};

// Like a review
export const likeReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id);
    const userId = new mongoose.Types.ObjectId((req as any).user._id);

    if (!review) {
      return next(new NotFoundError('Review not found'));
    }

    // Check if user has already liked the review
    const hasLiked = review.likes.some(id => id.toString() === userId.toString());

    if (hasLiked) {
      return next(new BadRequestError('You have already liked this review'));
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
  } catch (error) {
    next(error);
  }
};

// Unlike a review
export const unlikeReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id);
    const userId = new mongoose.Types.ObjectId((req as any).user._id);

    if (!review) {
      return next(new NotFoundError('Review not found'));
    }

    // Check if user has liked the review
    const hasLiked = review.likes.some(id => id.toString() === userId.toString());

    if (!hasLiked) {
      return next(new BadRequestError('You have not liked this review'));
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
  } catch (error) {
    next(error);
  }
};
