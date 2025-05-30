import { Request, Response, NextFunction } from 'express';
import MenuItem from '@/models/MenuItem';
import { BadRequestError, NotFoundError } from '@/utils/apiError';
import { IMenuItem } from '@/types/menuItem.types';
import { protect, restrictTo } from '../middleware/auth';
import Restaurant from '@/models/Restaurant';

// Get all menu items with filters
export const getAllMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract query parameters
    const {
      name,
      category,
      minPrice,
      maxPrice,
      restaurant,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query: any = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (category) query.category = category;
    if (minPrice) query.price = { $gte: Number(minPrice) };
    if (maxPrice) query.price = { $lte: Number(maxPrice) };
    if (restaurant) query.restaurant = restaurant;

    // Build sort
    const sortOptions: any = {};
    if (sort === 'price') sortOptions.price = 1;
    else if (sort === '-price') sortOptions.price = -1;
    else if (sort === 'name') sortOptions.name = 1;
    else sortOptions.createdAt = -1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count
    const total = await MenuItem.countDocuments(query);

    // Get menu items
    const menuItems = await MenuItem.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('restaurant', 'name');

    res.status(200).json({
      status: 'success',
      results: menuItems.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: menuItems,
    });
  } catch (error) {
    next(error);
  }
};

// Create new menu item
export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is restaurant owner
    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    if (!restaurant.owner.equals(req.user._id)) {
      throw new BadRequestError('You do not have permission to create menu items for this restaurant');
    }

    const menuItem = await MenuItem.create(req.body);

    // Add menu item to restaurant
    await Restaurant.findByIdAndUpdate(
      req.body.restaurant,
      { $push: { menu: menuItem._id } }
    );

    res.status(201).json({
      status: 'success',
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// Get menu item by ID
export const getMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('restaurant', 'name');

    if (!menuItem) {
      throw new NotFoundError('Menu item not found');
    }

    res.status(200).json({
      status: 'success',
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// Update menu item
export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      throw new NotFoundError('Menu item not found');
    }

    // Check if user is owner of the restaurant
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant || !restaurant.owner.equals(req.user._id)) {
      throw new BadRequestError('You do not have permission to update this menu item');
    }

    // Update menu item
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('restaurant', 'name');

    res.status(200).json({
      status: 'success',
      data: updatedMenuItem,
    });
  } catch (error) {
    next(error);
  }
};

// Delete menu item
export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      throw new NotFoundError('Menu item not found');
    }

    // Check if user is owner of the restaurant
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant || !restaurant.owner.equals(req.user._id)) {
      throw new BadRequestError('You do not have permission to delete this menu item');
    }

    // Remove menu item from restaurant
    await Restaurant.findByIdAndUpdate(
      menuItem.restaurant,
      { $pull: { menu: menuItem._id } }
    );

    await menuItem.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get menu items by restaurant
export const getMenuItemsByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name');

    res.status(200).json({
      status: 'success',
      results: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    next(error);
  }
};
