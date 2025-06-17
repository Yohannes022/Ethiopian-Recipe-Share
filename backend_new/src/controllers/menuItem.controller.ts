import { Request, Response, NextFunction } from 'express';
import mongoose, { FilterQuery, Types } from 'mongoose';
import MenuItem, { IMenuItem } from '@/models/menuItem.model';
import Restaurant from '@/models/restaurant.model';
import AppError from '@/utils/appError';
import { IUser } from '@/models/user.model';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
    }
  }
}

// Helper function to check if user is the owner of the restaurant
const checkRestaurantOwnership = async (req: Request, next: NextFunction) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId || req.body.restaurant);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  // Ensure user is authenticated
  if (!req.user) {
    return next(new AppError('You must be logged in to perform this action', 401));
  }

  // Type assertion for user
  const user = req.user as IUser & { _id: Types.ObjectId };
  
  // Check if the current user is the owner of the restaurant or an admin
  if (restaurant.owner.toString() !== user._id.toString() && user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  
  return restaurant;
};

// @desc    Get all menu items (with filtering, sorting, pagination)
// @route   GET /api/menu-items
// @access  Public
export const getAllMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    const filteredQuery = Object.fromEntries(
      Object.entries(queryObj).filter(([key]) => !excludedFields.includes(key))
    );

    // 2) Advanced filtering
    let queryStr = JSON.stringify(filteredQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // Create base query with proper typing
    const filter = JSON.parse(queryStr) as FilterQuery<IMenuItem>;
    let query = MenuItem.find<IMenuItem>(filter);

    // 3) Sorting
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 4) Field limiting
    if (req.query.fields) {
      const fields = (req.query.fields as string).split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 5) Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query with proper typing
    const menuItems = await query.lean().exec();
    if (!menuItems) {
      return next(new AppError('No menu items found', 404));
    }

    res.status(200).json({
      status: 'success',
      results: menuItems.length,
      data: {
        menuItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu-items
// @access  Private/Restaurant Owner
export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if the restaurant exists and the user is the owner
    const restaurant = await checkRestaurantOwnership(req, next);
    if (restaurant instanceof AppError) return next(restaurant);

    // Set the restaurant ID from the request params if not provided in the body
    if (!req.body.restaurant) {
      req.body.restaurant = req.params.restaurantId;
    }

    const newMenuItem = await MenuItem.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        menuItem: newMenuItem
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single menu item by ID
// @route   GET /api/menu-items/:id
// @access  Public
export const getMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant', 'name');

    if (!menuItem) {
      return next(new AppError('No menu item found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        menuItem
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu-items/:id
// @access  Private/Restaurant Owner
export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First find the menu item to get the restaurant ID
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return next(new AppError('No menu item found with that ID', 404));
    }

    // Check if the user is the owner of the restaurant
    req.params.restaurantId = menuItem.restaurant.toString();
    const restaurant = await checkRestaurantOwnership(req, next);
    if (restaurant instanceof AppError) return next(restaurant);

    // Update the menu item
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        menuItem: updatedMenuItem
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu-items/:id
// @access  Private/Restaurant Owner
export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First find the menu item to get the restaurant ID
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return next(new AppError('No menu item found with that ID', 404));
    }

    // Check if the user is the owner of the restaurant
    req.params.restaurantId = menuItem.restaurant.toString();
    const restaurant = await checkRestaurantOwnership(req, next);
    if (restaurant instanceof AppError) return next(restaurant);

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all menu items for a specific restaurant
// @route   GET /api/restaurants/:restaurantId/menu-items
// @access  Public
export const getMenuItemsByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if the restaurant exists
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return next(new AppError('No restaurant found with that ID', 404));
    }

    // Build query
    const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId })
      .lean()
      .exec();
    
    if (!menuItems) {
      return next(new AppError('No menu items found for this restaurant', 404));
    }

    res.status(200).json({
      status: 'success',
      results: menuItems.length,
      data: {
        menuItems
      }
    });
  } catch (error) {
    next(error);
  }
};
