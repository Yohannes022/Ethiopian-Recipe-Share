import { Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';
import Restaurant from '@/models/Restaurant';
import { BadRequestError, NotFoundError } from '@/utils/apiError';

// Type for query parameters
interface RestaurantQueryParams extends ParsedQs {
  name?: string;
  cuisine?: string;
  category?: string;
  minRating?: string;
  maxRating?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

// Get all restaurants with filters
export const getAllRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract query parameters
    const {
      name,
      cuisine,
      category,
      minRating,
      maxRating,
      minPrice,
      maxPrice,
      sort,
      page = '1',
      limit = '10',
    } = req.query as RestaurantQueryParams;

    // Build query
    const query: any = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (cuisine) query.cuisine = { $in: cuisine.split(',') };
    if (category) query.category = category;
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (maxRating) query.rating = { $lte: Number(maxRating) };
    if (minPrice) query.menu = { $elemMatch: { price: { $gte: Number(minPrice) } } };
    if (maxPrice) query.menu = { $elemMatch: { price: { $lte: Number(maxPrice) } } };

    // Build sort
    const sortOptions: any = {};
    if (sort === 'newest') sortOptions.createdAt = -1;
    else if (sort === 'oldest') sortOptions.createdAt = 1;
    else if (sort === 'rating') sortOptions.rating = -1;
    else if (sort === 'price') sortOptions.menu = 1;
    else sortOptions.createdAt = -1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count
    const total = await Restaurant.countDocuments(query);

    // Get restaurants
    const restaurants = await Restaurant.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'name photo')
      .populate('category', 'name')
      .populate('menu', 'name price category');

    res.status(200).json({
      status: 'success',
      results: restaurants.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// Create new restaurant
export const createRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is restaurant owner
    if (req.user.role !== 'restaurant_owner') {
      throw new BadRequestError('You must be a restaurant owner to create a restaurant');
    }

    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant by ID
export const getRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name photo')
      .populate('category', 'name')
      .populate('menu', 'name price category')
      .populate('reviews', 'rating comment user');

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    res.status(200).json({
      status: 'success',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Update restaurant
export const updateRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    // Check if user is owner or admin
    if (!restaurant.owner.equals(req.user._id) && req.user.role !== 'admin') {
      throw new BadRequestError('You do not have permission to update this restaurant');
    }

    // Update restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('owner', 'name photo').populate('category', 'name');

    res.status(200).json({
      status: 'success',
      data: updatedRestaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Delete restaurant
export const deleteRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    // Check if user is owner or admin
    if (!restaurant.owner.equals(req.user._id) && req.user.role !== 'admin') {
      throw new BadRequestError('You do not have permission to delete this restaurant');
    }

    await restaurant.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurants by owner
export const getRestaurantsByOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.params.ownerId })
      .sort({ createdAt: -1 })
      .populate('owner', 'name photo')
      .populate('category', 'name');

    res.status(200).json({
      status: 'success',
      results: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant menu
export const getRestaurantMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('menu', 'name description price category image');

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    res.status(200).json({
      status: 'success',
      data: restaurant.menu,
    });
  } catch (error) {
    next(error);
  }
};
