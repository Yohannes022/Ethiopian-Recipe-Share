import express from 'express';
import * as menuItemController from '@/controllers/menuItem.controller';
import { protect, restrictTo } from '@/middlewares/auth.middleware';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', menuItemController.getAllMenuItems);
router.get('/:id', menuItemController.getMenuItem);

// Protected routes (require authentication)
router.use(protect);

// Routes for getting menu items by restaurant
router.get('/restaurants/:restaurantId/menu-items', menuItemController.getMenuItemsByRestaurant);

// Routes that require restaurant owner or admin role
router.use(restrictTo('restaurant_owner', 'admin'));

router.post('/', menuItemController.createMenuItem);
router
  .route('/:id')
  .put(menuItemController.updateMenuItem)
  .delete(menuItemController.deleteMenuItem);

export default router;
