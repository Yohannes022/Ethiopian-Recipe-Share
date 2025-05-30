import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Notification from '@/models/Notification';
import { BadRequestError, NotFoundError } from '@/utils/apiError';
import { INotification } from '@/types/notification.types';
import { protect } from '../middleware/auth';

// Get all notifications with filters
export const getAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract query parameters
    const {
      type,
      read,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query: any = { user: req.user._id };

    if (type) query.type = type;
    if (read !== undefined) query.read = read === 'true';

    // Build sort
    const sortOptions: any = {};
    if (sort === 'type') sortOptions.type = 1;
    else if (sort === '-type') sortOptions.type = -1;
    else sortOptions.createdAt = -1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count
    const total = await Notification.countDocuments(query);

    // Get notifications
    const notifications = await Notification.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name photo')
      .populate('related', '_id name image');

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.status(200).json({
      status: 'success',
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Check if notification belongs to user
    if (!notification.user.equals(req.user._id)) {
      throw new BadRequestError('You do not have permission to mark this notification as read');
    }

    notification.markAsRead();
    await notification.save();

    res.status(200).json({
      status: 'success',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Check if notification belongs to user
    if (!notification.user.equals(req.user._id)) {
      throw new BadRequestError('You do not have permission to delete this notification');
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Create notification (utility function)
export const createNotification = async (
  user: mongoose.Types.ObjectId,
  type: string,
  message: string,
  relatedId: mongoose.Types.ObjectId,
  relatedType: string,
  io: any
) => {
  try {
    const notification = await Notification.create({
      user,
      type,
      message,
      relatedId,
      relatedType,
    });

    // Emit socket event for real-time updates
    io.to(`user_${user}`).emit('newNotification', {
      notification,
      unreadCount: await Notification.countDocuments({
        user,
        read: false,
      }),
    });

    return notification;
  } catch (error) {
    throw error;
  }
};
