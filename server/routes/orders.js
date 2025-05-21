const express = require('express');
const { check } = require('express-validator');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth.protect);

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post(
  '/',
  [
    [
      check('items', 'Please add items to your order').isArray({ min: 1 }),
      check('items.*.menuItem', 'Please provide a valid menu item ID').isMongoId(),
      check('items.*.quantity', 'Please provide a valid quantity').isInt({ min: 1 }),
      check('deliveryAddress', 'Please provide a delivery address').exists(),
      check('paymentMethod', 'Please provide a payment method').isIn(['cash', 'card', 'mobile_money']),
    ],
  ],
  orderController.createOrder
);

// @route   GET /api/orders
// @desc    Get all orders (user's orders, or all orders for admin/restaurant owner)
// @access  Private
router.get('/', orderController.getOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', orderController.getOrder);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (for restaurant owners/admins)
// @access  Private (Restaurant Owner or Admin)
router.put(
  '/:id/status',
  [
    auth.authorize('restaurant_owner', 'admin'),
    [
      check('status', 'Please provide a valid status').isIn([
        'pending', 'confirmed', 'preparing', 'ready', 'on_delivery', 'delivered', 'cancelled'
      ]),
    ],
  ],
  orderController.updateOrderStatus
);

module.exports = router;
