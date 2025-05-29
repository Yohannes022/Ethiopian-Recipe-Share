import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as restaurantController from '../../controllers/restaurant.controller';
import * as restaurantValidation from '../../validations/restaurant.validation';
import { upload } from '../../middleware/upload';

const router = Router();

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:restaurantId', validate(restaurantValidation.getRestaurant), restaurantController.getRestaurant);
router.get('/owner/:ownerId', validate(restaurantValidation.getOwnerRestaurants), restaurantController.getOwnerRestaurants);

// Protected routes
router.use(auth());

// Restaurant CRUD (owner/admin only)
router.post(
  '/',
  upload.array('images', 5),
  validate(restaurantValidation.createRestaurant),
  restaurantController.createRestaurant
);

router
  .route('/:restaurantId')
  .patch(
    upload.array('images', 5),
    validate(restaurantValidation.updateRestaurant),
    restaurantController.updateRestaurant
  )
  .delete(validate(restaurantValidation.deleteRestaurant), restaurantController.deleteRestaurant);

// Menu items
router.get('/:restaurantId/menu', validate(restaurantValidation.getRestaurantMenu), restaurantController.getRestaurantMenu);

// Restaurant interactions
router.post(
  '/:restaurantId/review',
  validate(restaurantValidation.reviewRestaurant),
  restaurantController.reviewRestaurant
);

export default router;
