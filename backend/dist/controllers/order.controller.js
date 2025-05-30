"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByUser = exports.getOrdersByRestaurant = exports.updateOrderStatus = exports.getOrder = exports.createOrder = exports.getAllOrders = void 0;
const Order_1 = __importDefault(require("@/models/Order"));
const apiError_1 = require("@/utils/apiError");
const Restaurant_1 = __importDefault(require("@/models/Restaurant"));
const User_1 = __importDefault(require("@/models/User"));
// Get all orders with filters
const getAllOrders = async (req, res, next) => {
    try {
        // Extract query parameters
        const { status, restaurant, user, sort, page = 1, limit = 10, } = req.query;
        // Build query
        const query = {};
        if (status)
            query.status = status;
        if (restaurant)
            query.restaurant = restaurant;
        if (user)
            query.user = user;
        // Build sort
        const sortOptions = {};
        if (sort === 'status')
            sortOptions.status = 1;
        else if (sort === '-status')
            sortOptions.status = -1;
        else if (sort === 'total')
            sortOptions.total = 1;
        else
            sortOptions.createdAt = -1;
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get total count
        const total = await Order_1.default.countDocuments(query);
        // Get orders
        const orders = await Order_1.default.find(query)
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllOrders = getAllOrders;
// Create new order
const createOrder = async (req, res, next) => {
    try {
        // Calculate total for each order item
        const items = req.body.items.map((item) => ({
            ...item,
            price: item.price * item.quantity,
        }));
        // Create order
        const order = await Order_1.default.create({
            ...req.body,
            items,
            user: req.user._id,
        });
        // Update restaurant's orders
        await Restaurant_1.default.findByIdAndUpdate(req.body.restaurant, { $push: { orders: order._id } });
        // Update user's orders
        await User_1.default.findByIdAndUpdate(req.user._id, { $push: { orders: order._id } });
        res.status(201).json({
            status: 'success',
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
// Get order by ID
const getOrder = async (req, res, next) => {
    try {
        const order = await Order_1.default.findById(req.params.id)
            .populate('user', 'name phone email')
            .populate('restaurant', 'name phone email')
            .populate('items.menuItem', 'name description price image');
        if (!order) {
            throw new apiError_1.NotFoundError('Order not found');
        }
        // Check if user has access to this order
        if (!req.user.isAdmin && !order.user.equals(req.user._id) && !order.restaurant.equals(req.user._id)) {
            throw new apiError_1.BadRequestError('You do not have permission to view this order');
        }
        res.status(200).json({
            status: 'success',
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrder = getOrder;
// Update order status
const updateOrderStatus = async (req, res, next) => {
    try {
        // Check if user is restaurant owner or admin
        if (req.user.role !== 'admin' && req.user.role !== 'restaurant_owner') {
            throw new apiError_1.BadRequestError('You do not have permission to update order status');
        }
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            throw new apiError_1.NotFoundError('Order not found');
        }
        // Check if user owns the restaurant
        if (req.user.role === 'restaurant_owner') {
            const restaurant = await Restaurant_1.default.findById(order.restaurant);
            if (!restaurant || !restaurant.owner.equals(req.user._id)) {
                throw new apiError_1.BadRequestError('You do not have permission to update this order');
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
// Get orders by restaurant
const getOrdersByRestaurant = async (req, res, next) => {
    try {
        // Check if user owns the restaurant
        const restaurant = await Restaurant_1.default.findById(req.params.restaurantId);
        if (!restaurant || !restaurant.owner.equals(req.user._id)) {
            throw new apiError_1.BadRequestError('You do not have permission to view these orders');
        }
        const orders = await Order_1.default.find({ restaurant: req.params.restaurantId })
            .sort({ createdAt: -1 })
            .populate('user', 'name phone email')
            .populate('items.menuItem', 'name description price image');
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: orders,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrdersByRestaurant = getOrdersByRestaurant;
// Get orders by user
const getOrdersByUser = async (req, res, next) => {
    try {
        const orders = await Order_1.default.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('restaurant', 'name phone email')
            .populate('items.menuItem', 'name description price image');
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: orders,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrdersByUser = getOrdersByUser;
