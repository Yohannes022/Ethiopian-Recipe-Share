import { Request, Response, NextFunction } from 'express';
import User from '@/models/User';
import Restaurant from '@/models/Restaurant';
import Order from '@/models/Order';
import Review from '@/models/Review';
import { BadRequestError } from '@/utils/apiError';
import { protect, restrictTo } from '../middleware/auth';

// Get user analytics
export const getUserAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new BadRequestError('You must be an admin to view analytics');
    }

    const [userCount, restaurantCount, orderCount, reviewCount] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers: userCount,
        totalRestaurants: restaurantCount,
        totalOrders: orderCount,
        totalReviews: reviewCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant analytics
export const getRestaurantAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is restaurant owner
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant || !restaurant.owner.equals(req.user._id)) {
      throw new BadRequestError('You do not have permission to view these analytics');
    }

    const [orderCount, reviewCount, totalRevenue] = await Promise.all([
      Order.countDocuments({ restaurant: req.params.restaurantId }),
      Review.countDocuments({ restaurant: req.params.restaurantId }),
      Order.aggregate([
        { $match: { restaurant: new mongoose.Types.ObjectId(req.params.restaurantId) } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalOrders: orderCount,
        totalReviews: reviewCount,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get order analytics
export const getOrderAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new BadRequestError('You must be an admin to view analytics');
    }

    const [totalOrders, totalRevenue, orderStatus] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        orderStatus: orderStatus.map(status => ({
          status: status._id,
          count: status.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
