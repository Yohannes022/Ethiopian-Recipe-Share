import express from 'express';
import * as reviewController from '../controllers/review.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { body } from 'express-validator';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReview);
router.get('/restaurants/:restaurantId/reviews', reviewController.getRestaurantReviews);
router.get('/users/:userId/reviews', reviewController.getUserReviews);

// Protected routes (require authentication)
router.use(protect);

// Review voting
router.post('/:id/helpful', reviewController.toggleHelpfulVote);

// Review replies (restaurant owners and admins)
router.post(
  '/:id/reply',
  restrictTo('restaurant_owner', 'admin'),
  [
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Reply text is required')
      .isLength({ max: 1000 })
      .withMessage('Reply cannot be longer than 1000 characters')
  ],
  reviewController.addReply
);

// Review creation (authenticated users only)
router.post(
  '/',
  [
    body('restaurant')
      .notEmpty()
      .withMessage('Restaurant ID is required')
      .isMongoId()
      .withMessage('Invalid restaurant ID'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comment cannot be longer than 1000 characters')
  ],
  reviewController.createReview
);

// Update and delete reviews (review owner or admin)
router.put(
  '/:id',
  [
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comment cannot be longer than 1000 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected'])
      .withMessage('Invalid status')
  ],
  reviewController.updateReview
);

router.delete('/:id', reviewController.deleteReview);

export default router;
