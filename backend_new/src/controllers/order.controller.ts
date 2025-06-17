import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import { IOrder, OrderStatus } from '../models/order.model';
import { IUser } from '../models/user.model';
import { IRestaurant } from '../models/restaurant.model';
import { IMenuItem } from '../models/menuItem.model';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
    }
  }
}

// Helper type for authenticated user
type AuthenticatedUser = IUser & { _id: Types.ObjectId };

// Helper function to check if user is restaurant owner
const isRestaurantOwner = (user: AuthenticatedUser, restaurantId: string): boolean => {
  return user.role === 'restaurant_owner' && user._id.toString() === restaurantId;
};

// Helper function to check if user is admin
const isAdmin = (user: AuthenticatedUser): boolean => {
  return user.role === 'admin';
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { restaurant, items, deliveryAddress, deliveryInstructions, scheduledFor } = req.body;
  const user = req.user!;

  // 1) Validate input
  if (!restaurant || !items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Please provide restaurant and at least one menu item', 400));
  }

  // 2) Get restaurant details
  const restaurantDoc = await mongoose.model('Restaurant').findById(restaurant);
  if (!restaurantDoc) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  // 3) Validate menu items and calculate total
  let subtotal = 0;
  const menuItems = [];

  for (const item of items) {
    const menuItem = await mongoose.model('MenuItem').findById(item.menuItem);
    if (!menuItem) {
      return next(new AppError(`Menu item with ID ${item.menuItem} not found`, 404));
    }
    if (menuItem.restaurant.toString() !== restaurant) {
      return next(new AppError(`Menu item ${menuItem.name} does not belong to this restaurant`, 400));
    }
    if (!menuItem.isAvailable) {
      return next(new AppError(`Menu item ${menuItem.name} is not available`, 400));
    }

    const quantity = item.quantity || 1;
    const itemTotal = menuItem.price * quantity;
    subtotal += itemTotal;

    menuItems.push({
      menuItem: menuItem._id,
      quantity,
      price: menuItem.price,
      specialInstructions: item.specialInstructions
    });
  }

  // 4) Calculate taxes and fees
  const taxRate = 0.15; // 15% tax
  const tax = subtotal * taxRate;
  const deliveryFee = restaurantDoc.deliveryOptions?.deliveryFee || 0;
  const total = subtotal + tax + deliveryFee;

  // 5) Create order
  const order = await mongoose.model('Order').create({
    user: user._id,
    restaurant: restaurantDoc._id,
    items: menuItems,
    deliveryAddress: deliveryAddress || user.address,
    deliveryInstructions,
    subtotal,
    tax,
    deliveryFee,
    total,
    payment: {
      method: 'cash', // Default to cash on delivery
      status: 'pending',
      amount: total,
      currency: 'ETB'
    },
    scheduledFor: scheduledFor || undefined
  });

  // 6) Populate the response with necessary data
  const populatedOrder = await order
    .populate('restaurant', 'name image')
    .populate('items.menuItem', 'name image')
    .execPopulate();

  res.status(201).json({
    status: 'success',
    data: {
      order: populatedOrder
    }
  });
});

// @desc    Get all orders (for admin) or user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user!;
  let query: any = {};

  // Regular users can only see their own orders
  if (user.role === 'user') {
    query.user = user._id;
  } 
  // Restaurant owners can see orders for their restaurants
  else if (user.role === 'restaurant_owner') {
    const restaurants = await mongoose.model('Restaurant').find({ owner: user._id });
    query.restaurant = { $in: restaurants.map(r => r._id) };
  }
  // Admin can see all orders

  const orders = await mongoose.model('Order').find(query)
    .populate('user', 'name email')
    .populate('restaurant', 'name')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = req.user!;

  const order = await mongoose.model('Order').findById(id)
    .populate('user', 'name email phone')
    .populate('restaurant', 'name phone')
    .populate('items.menuItem', 'name price');

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Check if user has permission to view this order
  const isOwner = order.user._id.toString() === user._id.toString();
  const isRestaurantOwner = user.role === 'restaurant_owner' && 
    order.restaurant._id.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isRestaurantOwner && !isAdmin) {
    return next(new AppError('You are not authorized to view this order', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant Owner/Admin)
const updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, cancellationReason } = req.body;
  const user = req.user!;

  // Validate status
  const validStatuses: OrderStatus[] = [
    'pending', 'confirmed', 'preparing', 'ready_for_pickup', 
    'out_for_delivery', 'delivered', 'cancelled'
  ];
  
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  const order = await mongoose.model('Order').findById(id);
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Check if user has permission to update this order
  const isOrderRestaurantOwner = user.role === 'restaurant_owner' && 
    order.restaurant.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isOrderRestaurantOwner && !isAdmin) {
    return next(new AppError('You are not authorized to update this order', 403));
  }

  // Update order status
  order.status = status;
  
  // If cancelling, require a reason
  if (status === 'cancelled' && !cancellationReason) {
    return next(new AppError('Please provide a reason for cancellation', 400));
  }
  
  if (cancellationReason) {
    order.cancellationReason = cancellationReason;
  }

  // Update timestamps based on status
  const now = new Date();
  if (status === 'delivered') {
    order.actualDeliveryTime = now;
  } else if (status === 'preparing') {
    // Set estimated delivery time (e.g., 30-60 minutes from now)
    const estimatedTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    order.estimatedDeliveryTime = estimatedTime;
  }

  await order.save();

  // TODO: Send notification to user about status update

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Get orders by restaurant
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private (Restaurant Owner/Admin)
const getOrdersByRestaurant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { restaurantId } = req.params;
  const user = req.user!;

  // Check if restaurant exists and user has permission
  const restaurant = await mongoose.model('Restaurant').findById(restaurantId);
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  // Check if user is the owner or admin
  if (user.role !== 'admin' && restaurant.owner.toString() !== user._id.toString()) {
    return next(new AppError('You are not authorized to view these orders', 403));
  }

  const orders = await mongoose.model('Order')
    .find({ restaurant: restaurantId })
    .populate('user', 'name email phone')
    .populate('items.menuItem', 'name price')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// @desc    Get orders by user
// @route   GET /api/orders/user/:userId
// @access  Private (Admin/Owner)
const getOrdersByUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const user = req.user!;

  // Check if user is admin or requesting their own orders
  if (user.role !== 'admin' && user._id.toString() !== userId) {
    return next(new AppError('You are not authorized to view these orders', 403));
  }

  const orders = await mongoose.model('Order')
    .find({ user: userId })
    .populate('restaurant', 'name image')
    .populate('items.menuItem', 'name price')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByRestaurant,
  getOrdersByUser
};
