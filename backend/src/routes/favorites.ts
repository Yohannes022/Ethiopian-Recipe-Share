import { Router } from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/favorite.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addFavoriteSchema } from '../validations/favorite.validation';

const router = Router();

// All favorites routes require authentication
router.use(auth);

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       required:
 *         - user
 *         - itemType
 *         - itemId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the favorite
 *         user:
 *           type: string
 *           description: ID of the user who favorited the item
 *         itemType:
 *           type: string
 *           enum: [Recipe, Restaurant, MenuItem]
 *           description: The type of the favorited item
 *         itemId:
 *           type: string
 *           description: ID of the favorited item
 *         item:
 *           type: object
 *           description: The populated favorited item
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the favorite was created
 */

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: User favorites management
 */

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Recipe, Restaurant, MenuItem]
 *         description: Filter favorites by type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of favorites to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of user's favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getFavorites);

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Add item to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemType
 *               - itemId
 *             properties:
 *               itemType:
 *                 type: string
 *                 enum: [Recipe, Restaurant, MenuItem]
 *                 description: Type of the item to favorite
 *               itemId:
 *                 type: string
 *                 description: ID of the item to favorite
 *     responses:
 *       201:
 *         description: Item added to favorites
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Item already in favorites or invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.post('/', validate(addFavoriteSchema), addFavorite);

/**
 * @swagger
 * /api/favorites/{id}:
 *   delete:
 *     summary: Remove item from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the favorite to remove
 *     responses:
 *       200:
 *         description: Item removed from favorites
 *       400:
 *         description: Invalid favorite ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite not found
 */
router.delete('/:id', removeFavorite);

export default router;
