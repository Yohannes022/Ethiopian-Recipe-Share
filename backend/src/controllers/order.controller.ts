import { Request, Response, NextFunction } from 'express';
import Order from '@/models/Order';
import { BadRequestError, NotFoundError } from '@/utils/apiError';
import { IOrder } from '@/types/order.types';
import { protect, restrictTo } from '../middleware/auth';
import Restaurant from '@/models/Restaurant';
import User from '@/models/User';

// Get all orders with filters
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract query parameters
    const {
      status,
      restaurant,
      user,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query: any = {};

    if (status) query.status = status;
    if (restaurant) query.restaurant = restaurant;
    if (user) query.user = user;

    // Build sort
    const sortOptions: any = {};
    if (sort === 'status') sortOptions.status = 1;
    else if (sort === '-status') sortOptions.status = -1;
    else if (sort === 'total') sortOptions.total = 1;
    else sortOptions.createdAt = -1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count
    const total = await Order.countDocuments(query);

    // Get orders
    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name phone email')
      .populate('restaurant', 'name phone email')
      .populate('items.menuItem', 'name description price image');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// Create new order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Calculate total for each order item
    const items = req.body.items.map((item: any) => ({
      ...item,
      price: item.price * item.quantity,
    }));

    // Create order
    const order = await Order.create({
      ...req.body,
      items,
      user: req.user._id,
    });

    // Update restaurant's orders
    await Restaurant.findByIdAndUpdate(
      req.body.restaurant,
      { $push: { orders: order._id } }
    );

    // Update user's orders
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { orders: order._id } }
    );

    res.status(201).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name phone email')
      .populate('restaurant', 'name phone email')
      .populate('items.menuItem', 'name description price image');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if user has access to this order
    if (!req.user.isAdmin && !order.user.equals(req.user._id) && !order.restaurant.equals(req.user._id)) {
      throw new BadRequestError('You do not have permission to view this order');
    }

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is restaurant owner or admin
    if (req.user.role !== 'admin' && req.user.role !== 'restaurant_owner') {
      throw new BadRequestError('You do not have permission to update order status');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if user owns the restaurant
    if (req.user.role === 'restaurant_owner') {
      const restaurant = await Restaurant.findById(order.restaurant);
      if (!restaurant || !restaurant.owner.equals(req.user._id)) {
        throw new BadRequestError('You do not have permission to update this order');
      }
    }

    // Update order status
    order.updateStatus(req.body.status);
    await order.save();

    // Emit socket event for real-time updates
    req.app.get('io').to(`restaurant_${order.restaurant}`).emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
    });

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get orders by restaurant
export const getOrdersByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user owns the restaurant
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant || !restaurant.owner.equals(req.user._id)) {
      throw new BadRequestError('You do not have permission to view these orders');
    }

    const orders = await Order.find({ restaurant: req.params.restaurantId })
      .sort({ createdAt: -1 })
      .populate('user', 'name phone email')
      .populate('items.menuItem', 'name description price image');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get orders by user
export const getOrdersByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name phone email')
      .populate('items.menuItem', 'name description price image');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
