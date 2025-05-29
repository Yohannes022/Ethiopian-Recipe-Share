import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getOrdersByRestaurant,
  getOrdersByUser,
} from '../controllers/order.controller';
import { auth, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../validations/order.validation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - items
 *         - totalAmount
 *         - deliveryAddress
 *         - paymentMethod
 *         - user
 *         - restaurant
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the order
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               menuItem:
 *                 type: string
 *                 description: ID of the menu item
 *               name:
 *                 type: string
 *                 description: Name of the menu item at the time of ordering
 *               price:
 *                 type: number
 *                 description: Price of the menu item at the time of ordering
 *               quantity:
 *                 type: number
 *                 description: Quantity ordered
 *               specialInstructions:
 *                 type: string
 *                 description: Any special instructions for this item
 *         totalAmount:
 *           type: number
 *           minimum: 0
 *           description: Total amount of the order
 *         deliveryAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, mobile_money]
 *           description: Payment method used
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           default: pending
 *           description: Status of the payment
 *         orderStatus:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready_for_pickup, out_for_delivery, delivered, cancelled]
 *           default: pending
 *           description: Status of the order
 *         specialInstructions:
 *           type: string
 *           description: Any special instructions for the order
 *         user:
 *           type: string
 *           description: ID of the user who placed the order
 *         restaurant:
 *           type: string
 *           description: ID of the restaurant the order is placed at
 *         deliveryPerson:
 *           type: string
 *           description: ID of the delivery person assigned to the order
 *         estimatedDeliveryTime:
 *           type: string
 *           format: date-time
 *           description: Estimated time of delivery
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: Actual time of delivery
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the order was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the order was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and retrieval
 */

// Protected routes - require authentication
router.use(auth);

// User routes
router.get('/', getOrders);
router.post('/', validate(createOrderSchema), createOrder);
router.get('/user/:userId', getOrdersByUser);
router.get('/:id', getOrder);

// Restaurant owner and admin routes
router.get('/restaurant/:restaurantId', authorize(['owner', 'admin']), getOrdersByRestaurant);
router.put('/:id/status', authorize(['owner', 'admin']), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
