import { Router } from 'express';
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByRestaurant,
} from '../controllers/menuItem.controller';
import { auth, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMenuItemSchema, updateMenuItemSchema } from '../validations/menuItem.validation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MenuItem:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - restaurant
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the menu item
 *         name:
 *           type: string
 *           description: The name of the menu item
 *         description:
 *           type: string
 *           description: A short description of the menu item
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Price of the menu item
 *         image:
 *           type: string
 *           description: URL to the menu item image
 *         isVegetarian:
 *           type: boolean
 *           default: false
 *           description: Whether the menu item is vegetarian
 *         isVegan:
 *           type: boolean
 *           default: false
 *           description: Whether the menu item is vegan
 *         isGlutenFree:
 *           type: boolean
 *           default: false
 *           description: Whether the menu item is gluten-free
 *         isSpicy:
 *           type: boolean
 *           default: false
 *           description: Whether the menu item is spicy
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           description: List of ingredients
 *         category:
 *           type: string
 *           description: ID of the category this item belongs to
 *         restaurant:
 *           type: string
 *           description: ID of the restaurant this item belongs to
 *         isAvailable:
 *           type: boolean
 *           default: true
 *           description: Whether the menu item is currently available
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the menu item was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the menu item was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Menu Items
 *   description: Menu item management and retrieval
 */

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.get('/restaurant/:restaurantId', getMenuItemsByRestaurant);

// Protected routes - require authentication
router.use(auth);

// Owner and admin routes for creating/updating menu items
router.post('/', authorize(['owner', 'admin']), validate(createMenuItemSchema), createMenuItem);
router.put('/:id', authorize(['owner', 'admin']), validate(updateMenuItemSchema), updateMenuItem);
router.delete('/:id', authorize(['owner', 'admin']), deleteMenuItem);

export default router;
