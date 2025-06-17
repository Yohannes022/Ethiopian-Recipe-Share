import express from 'express';
import * as orderController from '../controllers/order.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate-request.middleware';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Order routes
router
  .route('/')
  .get(orderController.getOrders)
  .post(orderController.createOrder);

router
  .route('/:id')
  .get(orderController.getOrderById);

router
  .route('/:id/status')
  .put(restrictTo('restaurant_owner', 'admin'), orderController.updateOrderStatus);

router
  .route('/restaurant/:restaurantId')
  .get(restrictTo('restaurant_owner', 'admin'), orderController.getOrdersByRestaurant);

router
  .route('/user/:userId')
  .get(restrictTo('admin'), orderController.getOrdersByUser);

export default router;
