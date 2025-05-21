const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Calculate order total
    let subtotal = 0;
    const menuItems = [];

    // Get menu items and calculate subtotal
    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item with ID ${item.menuItem} not found`,
        });
      }
      subtotal += menuItem.price * item.quantity;
      menuItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || '',
      });
    }

    // Calculate tax (example: 10% tax rate)
    const tax = subtotal * 0.1;
    
    // Calculate delivery fee (example: $5 flat rate)
    const deliveryFee = 5;
    
    // Calculate total
    const total = subtotal + tax + deliveryFee;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      restaurant: items[0].restaurantId, // Assuming all items are from the same restaurant
      items: menuItems,
      deliveryAddress,
      subtotal,
      tax,
      deliveryFee,
      total,
      paymentMethod,
      specialInstructions,
    });

    // Populate order with user and restaurant details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .populate('items.menuItem', 'name price');

    res.status(201).json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    let query;

    // Check if user is admin or restaurant owner
    if (req.user.role === 'admin') {
      // Admin can see all orders
      query = Order.find({});
    } else if (req.user.role === 'restaurant_owner') {
      // Restaurant owner can see orders for their restaurants
      const restaurants = await Restaurant.find({ owner: req.user.id });
      const restaurantIds = restaurants.map(r => r._id);
      query = Order.find({ restaurant: { $in: restaurantIds } });
    } else {
      // Regular users can only see their own orders
      query = Order.find({ user: req.user.id });
    }

    const orders = await query
      .sort('-createdAt')
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .populate('items.menuItem', 'name price');

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .populate('items.menuItem', 'name price description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user is authorized to view this order
    if (
      order.user._id.toString() !== req.user.id && 
      req.user.role !== 'admin' &&
      req.user.role !== 'restaurant_owner'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant Owner or Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user is authorized to update this order
    if (req.user.role === 'restaurant_owner') {
      const restaurant = await Restaurant.findById(order.restaurant);
      if (restaurant.owner.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to update this order',
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update orders',
      });
    }

    // Update status
    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
