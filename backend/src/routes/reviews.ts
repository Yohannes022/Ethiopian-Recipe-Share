import { Router } from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getReviewsByRestaurant,
  getReviewsByUser,
} from '../controllers/review.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema, updateReviewSchema } from '../validations/review.validation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - rating
 *         - comment
 *         - user
 *         - targetType
 *         - targetId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the review
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating from 1 to 5 stars
 *         comment:
 *           type: string
 *           description: The review comment
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         user:
 *           type: string
 *           description: ID of the user who wrote the review
 *         targetType:
 *           type: string
 *           enum: [Restaurant, Recipe]
 *           description: The type of the item being reviewed
 *         targetId:
 *           type: string
 *           description: ID of the item being reviewed
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the review
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Whether the review is verified (e.g., from a verified purchase)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the review was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the review was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management and retrieval
 */

// Public routes
router.get('/', getReviews);
router.get('/:id', getReview);
router.get('/restaurant/:restaurantId', getReviewsByRestaurant);
router.get('/user/:userId', getReviewsByUser);

// Protected routes - require authentication
router.use(auth);

router.post('/', validate(createReviewSchema), createReview);
router.put('/:id', validate(updateReviewSchema), updateReview);
router.delete('/:id', deleteReview);

export default router;
