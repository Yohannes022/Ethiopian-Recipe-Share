import { Request, Response, NextFunction } from 'express';
import Favorite from '@/models/Favorite';
import { BadRequestError, NotFoundError } from '@/utils/apiError';
import { IFavorite } from '@/types/favorite.types';
import { protect } from '../middleware/auth';

// Get all favorites with filters
export const getAllFavoritesByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract query parameters
    const {
      type,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query: any = { user: req.user._id };

    if (type) query.type = type;

    // Build sort
    const sortOptions: any = {};
    if (sort === 'type') sortOptions.type = 1;
    else if (sort === '-type') sortOptions.type = -1;
    else sortOptions.createdAt = -1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count
    const total = await Favorite.countDocuments(query);

    // Get favorites
    const favorites = await Favorite.find(query)
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
  } catch (error) {
    next(error);
  }
};

// Create favorite
export const createFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user has already favorited this item
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      type: req.body.type,
      itemId: req.body.itemId,
    });

    if (existingFavorite) {
      throw new BadRequestError('You have already favorited this item');
    }

    // Create favorite
    const favorite = await Favorite.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

// Delete favorite
export const deleteFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      throw new NotFoundError('Favorite not found');
    }

    // Check if favorite belongs to user
    if (!favorite.user.equals(req.user._id)) {
      throw new BadRequestError('You do not have permission to delete this favorite');
    }

    await Favorite.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get favorites by type
export const getFavoritesByTypeByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorites = await Favorite.find({
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
  } catch (error) {
    next(error);
  }
};

// Check if item is favorited
export const isItemFavorited = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user._id,
      type: req.params.type,
      itemId: req.params.itemId,
    });

    res.status(200).json({
      status: 'success',
      data: { favorited: !!favorite },
    });
  } catch (error) {
    next(error);
  }
};

// Get all favorites
export const getAllFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name photo')
      .populate('item', '_id name image');

    res.status(200).json({
      status: 'success',
      results: favorites.length,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

// Get favorites by type
export const getFavoritesByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorites = await Favorite.find({
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
  } catch (error) {
    next(error);
  }
};
