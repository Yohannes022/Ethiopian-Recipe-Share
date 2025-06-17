import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Restaurant, { IRestaurant } from '../models/restaurant.model';
import AppError from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

// Helper function to build filter object from query parameters
const buildFilter = (query: any) => {
  const filter: any = { isActive: true };
  
  if (query.city) filter['address.city'] = new RegExp(query.city, 'i');
  if (query.cuisine) filter.cuisineType = { $in: query.cuisine.split(',') };
  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.minRating) {
    filter['rating.average'] = { $gte: Number(query.minRating) };
  }
  
  return filter;
};

/**
 * @desc    Get all restaurants
 * @route   GET /api/restaurants
 * @access  Public
 */
export const getAllRestaurants = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const filter = buildFilter(req.query);
  
  // Sorting
  const sortBy = req.query.sortBy?.toString() || '-createdAt';
  const sortOptions: Record<string, 'asc' | 'desc'> = {};
  sortOptions[sortBy.replace(/^-/, '')] = sortBy.startsWith('-') ? 'desc' : 'asc';
  
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name email phone'),
    Restaurant.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: restaurants
  });
});

/**
 * @desc    Get single restaurant
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
export const getRestaurant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const restaurant = await Restaurant.findById(req.params.id)
    .populate('owner', 'name email phone')
    .populate('reviews');

  if (!restaurant || !restaurant.isActive) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: restaurant
  });
});

/**
 * @desc    Create new restaurant
 * @route   POST /api/restaurants
 * @access  Private/Owner & Admin
 */
export const createRestaurant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Only allow owners and admins to create restaurants
  if (req.user.role !== 'owner' && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to create a restaurant', 403));
  }

  const newRestaurant = await Restaurant.create({
    ...req.body,
    owner: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: newRestaurant
  });
});

/**
 * @desc    Update restaurant
 * @route   PUT /api/restaurants/:id
 * @access  Private/Owner & Admin
 */
export const updateRestaurant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  // Check if user is owner or admin
  if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this restaurant', 403));
  }

  // Prevent changing owner through this route
  if (req.body.owner) {
    delete req.body.owner;
  }

  const updatedRestaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: updatedRestaurant
  });
});

/**
 * @desc    Delete restaurant
 * @route   DELETE /api/restaurants/:id
 * @access  Private/Owner & Admin
 */
export const deleteRestaurant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  // Check if user is owner or admin
  if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this restaurant', 403));
  }

  // Soft delete by setting isActive to false
  restaurant.isActive = false;
  await restaurant.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * @desc    Get restaurants by owner
 * @route   GET /api/restaurants/owner/:ownerId
 * @access  Public
 */
export const getRestaurantsByOwner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.ownerId)) {
    return next(new AppError('Invalid owner ID', 400));
  }

  const restaurants = await Restaurant.find({ 
    owner: req.params.ownerId,
    isActive: true 
  }).select('-menu');

  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: restaurants
  });
});

/**
 * @desc    Get restaurant menu
 * @route   GET /api/restaurants/:id/menu
 * @access  Public
 */
export const getRestaurantMenu = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const restaurant = await Restaurant.findById(req.params.id)
    .select('menu name');

  if (!restaurant || !restaurant.isActive) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      restaurant: restaurant.name,
      menu: restaurant.menu
    }
  });
});

/**
 * @desc    Update restaurant menu
 * @route   PATCH /api/restaurants/:id/menu
 * @access  Private/Owner & Admin
 */
export const updateRestaurantMenu = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  // Check if user is owner or admin
  if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this menu', 403));
  }

  // Update menu items
  if (req.body.menu && Array.isArray(req.body.menu)) {
    restaurant.menu = req.body.menu;
    await restaurant.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      menu: restaurant.menu
    }
  });
});
