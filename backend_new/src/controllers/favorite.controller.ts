import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IFavorite } from '../models/favorite.model';
import { IUser } from '../models/user.model';
import { IRecipe } from '../models/recipe.model';
import { IRestaurant } from '../models/restaurant.model';
import Favorite from '../models/favorite.model';

export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const { type, itemId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      user: userId,
      type,
      itemId
    });

    if (existing) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Already favorited'
      });
    }

    const favorite = await Favorite.create({
      user: userId,
      type,
      itemId
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to add to favorites'
    });
  }
};

export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const favorite = await Favorite.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!favorite) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: 'Favorite not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to remove from favorites'
    });
  }
};

export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const query = { user: userId };
    if (type) {
      (query as any).type = type;
    }

    const favorites = await Favorite.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('item', 'title name image');

    const total = await Favorite.countDocuments(query);

    res.status(StatusCodes.OK).json({
      success: true,
      data: favorites,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch favorites'
    });
  }
};
