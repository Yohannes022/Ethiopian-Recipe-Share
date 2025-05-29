import { Router } from 'express';
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsByOwner,
  getRestaurantMenu,
} from '../controllers/restaurant.controller';
import { auth, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRestaurantSchema, updateRestaurantSchema } from '../validations/restaurant.validation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Restaurant:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - address
 *         - cuisineType
 *         - owner
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the restaurant
 *         name:
 *           type: string
 *           description: The name of the restaurant
 *         description:
 *           type: string
 *           description: A short description of the restaurant
 *         address:
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
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email
 *         website:
 *           type: string
 *           format: uri
 *           description: Restaurant website URL
 *         openingHours:
 *           type: object
 *           properties:
 *             monday:
 *               type: array
 *               items:
 *                 type: string
 *             tuesday:
 *               type: array
 *               items:
 *                 type: string
 *             wednesday:
 *               type: array
 *               items:
 *                 type: string
 *             thursday:
 *               type: array
 *               items:
 *                 type: string
 *             friday:
 *               type: array
 *               items:
 *                 type: string
 *             saturday:
 *               type: array
 *               items:
 *                 type: string
 *             sunday:
 *               type: array
 *               items:
 *                 type: string
 *         cuisineType:
 *           type: array
 *           items:
 *             type: string
 *           description: Types of cuisine served (e.g., Ethiopian, Italian)
 *         priceRange:
 *           type: string
 *           enum: [$, $$, $$$, $$$$]
 *           description: Price range indicator
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         isFeatured:
 *           type: boolean
 *           default: false
 *           description: Whether the restaurant is featured
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the restaurant is currently active
 *         owner:
 *           type: string
 *           description: ID of the user who owns the restaurant
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the restaurant was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the restaurant was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant management and retrieval
 */

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurant);
router.get('/:id/menu', getRestaurantMenu);
router.get('/owner/:ownerId', getRestaurantsByOwner);

// Protected routes - require authentication
router.use(auth);

// Owner and admin routes
router.post('/', authorize(['owner', 'admin']), validate(createRestaurantSchema), createRestaurant);
router.put('/:id', authorize(['owner', 'admin']), validate(updateRestaurantSchema), updateRestaurant);
router.delete('/:id', authorize(['owner', 'admin']), deleteRestaurant);

export default router;
