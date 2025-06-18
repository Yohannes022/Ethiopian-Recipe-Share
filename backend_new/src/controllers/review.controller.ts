import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import { ReviewStatus } from '../models/review.model';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../models/user.model';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
    }
  }
}

// Helper function to get authenticated user with type safety
const getAuthenticatedUser = (req: Request): { _id: Types.ObjectId; role: string } => {
  if (!req.user) {
    throw new AppError('You must be logged in to perform this action', 401);
  }
  return {
    _id: req.user._id,
    role: req.user.role || 'user'
  };
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  // Build query
  const filter: any = { status: ReviewStatus.APPROVED };
  
  // Filter by restaurant if provided
  if (req.query.restaurant) {
    filter.restaurant = req.query.restaurant;
  }
  
  // Filter by user if provided
  if (req.query.user) {
    filter.user = req.query.user;
  }
  
  // Filter by rating if provided
  if (req.query.rating) {
    filter.rating = { $gte: Number(req.query.rating) };
  }
  
  // Sorting
  let sort = '-createdAt'; // Default: newest first
  if (req.query.sort === 'oldest') {
    sort = 'createdAt';
  } else if (req.query.sort === 'highest') {
    sort = '-rating';
  } else if (req.query.sort === 'lowest') {
    sort = 'rating';
  } else if (req.query.sort === 'mostHelpful') {
    sort = '-helpfulCount';
  }
  
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Execute query
  const reviews = await mongoose.model('Review')
    .find(filter)
    .populate('user', 'name photo')
    .populate('restaurant', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await mongoose.model('Review').countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    totalPages: Math.ceil(total / limit),
    page,
    data: {
      reviews
    }
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
const getReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const review = await mongoose.model('Review').findById(req.params.id)
    .populate('user', 'name photo')
    .populate('restaurant', 'name')
    .populate('helpfulVotes', 'name photo');
    
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { restaurant, rating, comment } = req.body;
  const { _id: userId } = getAuthenticatedUser(req);
  
  // 1) Check if user has already reviewed this restaurant
  const existingReview = await mongoose.model('Review').findOne({
    user: userId,
    restaurant
  });
  
  if (existingReview) {
    return next(new AppError('You have already reviewed this restaurant', 400));
  }
  
  // 2) Create new review
  const review = await mongoose.model('Review').create({
    user: userId,
    restaurant,
    rating,
    comment,
    status: ReviewStatus.PENDING // Default status, can be changed by admin
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner or admin)
const updateReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { rating, comment } = req.body;
  const { _id: userId, role: userRole } = getAuthenticatedUser(req);
  
  // 1) Find review
  const review = await mongoose.model('Review').findById(req.params.id);
  
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  // 2) Check if user is the review owner or admin
  const isOwner = review.user.toString() === userId.toString();
  const isAdmin = userRole === 'admin';
  
  if (!isOwner && !isAdmin) {
    return next(new AppError('You are not authorized to update this review', 403));
  }
  
  // 3) Update review
  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  
  // If admin is updating, allow status change
  if (isAdmin && req.body.status) {
    review.status = req.body.status;
  }
  
  await review.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or admin)
const deleteReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { _id: userId, role: userRole } = getAuthenticatedUser(req);
  
  // 1) Find review
  const review = await mongoose.model('Review').findById(req.params.id);
  
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  // 2) Check if user is the review owner or admin
  const isOwner = review.user.toString() === userId.toString();
  const isAdmin = userRole === 'admin';
  
  if (!isOwner && !isAdmin) {
    return next(new AppError('You are not authorized to delete this review', 403));
  }
  
  // 3) Delete review
  await review.deleteOne();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Get reviews by restaurant
// @route   GET /api/restaurants/:restaurantId/reviews
// @access  Public
const getRestaurantReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { restaurantId } = req.params;
  
  // Check if restaurant exists
  const restaurant = await mongoose.model('Restaurant').findById(restaurantId);
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }
  
  // Build query
  const filter: any = { 
    restaurant: restaurantId,
    status: ReviewStatus.APPROVED
  };
  
  // Filter by rating if provided
  if (req.query.rating) {
    filter.rating = { $gte: Number(req.query.rating) };
  }
  
  // Sorting
  let sort = '-createdAt'; // Default: newest first
  if (req.query.sort === 'oldest') {
    sort = 'createdAt';
  } else if (req.query.sort === 'highest') {
    sort = '-rating';
  } else if (req.query.sort === 'lowest') {
    sort = 'rating';
  } else if (req.query.sort === 'mostHelpful') {
    sort = '-helpfulCount';
  }
  
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Get reviews with user info
  const reviews = await mongoose.model('Review')
    .find(filter)
    .populate('user', 'name photo')
    .populate('helpfulVotes', 'name photo')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await mongoose.model('Review').countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    totalPages: Math.ceil(total / limit),
    page,
    data: {
      reviews
    }
  });
});

// @desc    Get reviews by user
// @route   GET /api/users/:userId/reviews
// @access  Public
const getUserReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  
  // Check if user exists
  const user = await mongoose.model('User').findById(userId);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  // Build query
  const filter: any = { 
    user: userId,
    status: ReviewStatus.APPROVED
  };
  
  // Sorting
  let sort = '-createdAt'; // Default: newest first
  if (req.query.sort === 'oldest') {
    sort = 'createdAt';
  } else if (req.query.sort === 'highest') {
    sort = '-rating';
  } else if (req.query.sort === 'lowest') {
    sort = 'rating';
  }
  
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Get reviews with restaurant info
  const reviews = await mongoose.model('Review')
    .find(filter)
    .populate('restaurant', 'name image')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await mongoose.model('Review').countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    totalPages: Math.ceil(total / limit),
    page,
    data: {
      reviews
    }
  });
});

// @desc    Toggle helpful vote on review
// @route   POST /api/reviews/:id/helpful
// @access  Private
const toggleHelpfulVote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { _id: userId } = getAuthenticatedUser(req);
  const reviewId = req.params.id;
  
  // 1) Find review
  const review = await mongoose.model('Review').findById(reviewId);
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  // 2) Check if user has already voted
  const voteIndex = review.helpfulVotes.findIndex(
    (vote: Types.ObjectId) => vote.toString() === userId.toString()
  );
  
  if (voteIndex === -1) {
    // Add vote
    review.helpfulVotes.push(userId);
  } else {
    // Remove vote
    review.helpfulVotes.splice(voteIndex, 1);
  }
  
  // Update helpfulCount
  review.helpfulCount = review.helpfulVotes.length;
  
  await review.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      helpfulCount: review.helpfulCount,
      hasVoted: voteIndex === -1 // true if user just voted, false if unvoted
    }
  });
});

// @desc    Add reply to review (Restaurant owner or admin)
// @route   POST /api/reviews/:id/reply
// @access  Private (Restaurant owner or admin)
const addReply = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { text } = req.body;
  const { _id: userId, role: userRole } = getAuthenticatedUser(req);
  
  // 1) Find review
  const review = await mongoose.model('Review')
    .findById(req.params.id)
    .populate('restaurant', 'owner');
    
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  // 2) Check if user is the restaurant owner or admin
  const isRestaurantOwner = userRole === 'restaurant_owner' && 
    review.restaurant.owner.toString() === userId.toString();
  const isAdmin = userRole === 'admin';
  
  if (!isRestaurantOwner && !isAdmin) {
    return next(new AppError('You are not authorized to reply to this review', 403));
  }
  
  // 3) Add/Update reply
  review.reply = {
    text,
    repliedBy: userId,
    repliedAt: new Date()
  };
  
  await review.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

export {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getRestaurantReviews,
  getUserReviews,
  toggleHelpfulVote,
  addReply
};
