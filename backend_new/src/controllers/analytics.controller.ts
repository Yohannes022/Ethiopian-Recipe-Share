import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import User from '@/models/user.model';
import Order from '@/models/order.model';
import Restaurant from '@/models/restaurant.model';
import moment from 'moment';

interface AnalyticsResponse {
  total: number;
  active: number;
  inactive: number;
  last7Days: number;
  last30Days: number;
  byMonth: Array<{
    month: string;
    count: number;
  }>;
}

export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, active, inactive, last7DaysCount, last30DaysCount, monthlyStats] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ isEmailVerified: false }),
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ])
    ]);

    const formattedMonthlyStats = monthlyStats.map(stat => ({
      month: moment(stat._id).format('MMM YYYY'),
      count: stat.count
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        total,
        active,
        inactive,
        last7Days: last7DaysCount,
        last30Days: last30DaysCount,
        byMonth: formattedMonthlyStats
      }
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
};

export const getOrderAnalytics = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, last7DaysCount, last30DaysCount, monthlyStats, statusStats] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: last7Days } }),
      Order.countDocuments({ createdAt: { $gte: last30Days } }),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ])
    ]);

    const formattedMonthlyStats = monthlyStats.map(stat => ({
      month: moment(stat._id).format('MMM YYYY'),
      count: stat.count,
      totalAmount: stat.totalAmount
    }));

    const formattedStatusStats = statusStats.map(stat => ({
      status: stat._id,
      count: stat.count,
      totalAmount: stat.totalAmount
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        total,
        last7Days: last7DaysCount,
        last30Days: last30DaysCount,
        byMonth: formattedMonthlyStats,
        byStatus: formattedStatusStats
      }
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
};

export const getRestaurantAnalytics = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, active, inactive, last7DaysCount, last30DaysCount, monthlyStats, cuisineStats] = await Promise.all([
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ isActive: true }),
      Restaurant.countDocuments({ isActive: false }),
      Restaurant.countDocuments({ createdAt: { $gte: last7Days } }),
      Restaurant.countDocuments({ createdAt: { $gte: last30Days } }),
      Restaurant.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]),
      Restaurant.aggregate([
        {
          $group: {
            _id: '$cuisineType',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const formattedMonthlyStats = monthlyStats.map(stat => ({
      month: moment(stat._id).format('MMM YYYY'),
      count: stat.count
    }));

    const formattedCuisineStats = cuisineStats.map(stat => ({
      cuisineType: stat._id,
      count: stat.count
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        total,
        active,
        inactive,
        last7Days: last7DaysCount,
        last30Days: last30DaysCount,
        byMonth: formattedMonthlyStats,
        byCuisine: formattedCuisineStats
      }
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
};
