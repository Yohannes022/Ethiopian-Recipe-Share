import mongoose, { Types } from 'mongoose';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { INotification } from '../models/notification.model';
import { IUser } from '../models/user.model';
import { IRecipe } from '../models/recipe.model';
import { IRestaurant } from '../models/restaurant.model';
import Notification from '../models/notification.model';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const notifications = await Notification.find({ user: userId }) 
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate({
        path: 'reference',
        select: 'title name',
        match: { referenceType: 'recipe' }
      });

    const total = await Notification.countDocuments({ user: userId });

    res.status(StatusCodes.OK).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to update notification'
    });
  }
};
