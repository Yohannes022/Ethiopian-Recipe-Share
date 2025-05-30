import { Request, Response, NextFunction } from 'express';
import User from '@/models/User';
import { BadRequestError, NotFoundError } from '@/utils/apiError';
import { protect, restrictTo } from '../middleware/auth';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password -__v');
    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get specific user (admin only)
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin only)
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -__v');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's profile
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update current user's profile
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filteredBody = Object.keys(req.body).reduce((acc, key) => {
      if (key !== 'password' && key !== 'role') {
        acc[key] = req.body[key];
      }
      return acc;
    }, {});

    const user = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -__v');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete current user's profile
export const deleteMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's reviews
export const getReviewsByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name image')
      .populate('user', 'name photo');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
