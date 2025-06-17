import express from 'express';
import * as restaurantController from '@/controllers/restaurant.controller';
import { protect, restrictTo } from '@/middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurant);
router.get('/owner/:ownerId', restaurantController.getRestaurantsByOwner);
router.get('/:id/menu', restaurantController.getRestaurantMenu);

// Protected routes (require authentication)
router.use(protect);

// Owner and Admin only routes
router.post(
  '/',
  restrictTo('restaurant_owner', 'admin'),
  restaurantController.createRestaurant
);

router.put(
  '/:id',
  restrictTo('restaurant_owner', 'admin'),
  restaurantController.updateRestaurant
);

router.delete(
  '/:id',
  restrictTo('restaurant_owner', 'admin'),
  restaurantController.deleteRestaurant
);

// Menu management (for restaurant owners)
router.patch(
  '/:id/menu',
  restrictTo('restaurant_owner', 'admin'),
  restaurantController.updateRestaurantMenu
);

export default router;
