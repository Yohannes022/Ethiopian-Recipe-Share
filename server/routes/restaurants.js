const express = require('express');
const { check } = require('express-validator');
const restaurantController = require('../controllers/restaurantController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', restaurantController.getRestaurants);
router.get('/:id', restaurantController.getRestaurant);

// Protected routes (require authentication)
router.use(auth.protect);

// Routes that require restaurant owner or admin role
router.post(
  '/',
  [
    auth.protect,
    auth.authorize('restaurant_owner', 'admin'),
    [
      check('name', 'Please add a name').not().isEmpty(),
      check('description', 'Please add a description').not().isEmpty(),
      check('cuisineType', 'Please add a cuisine type').not().isEmpty(),
      check('address.street', 'Please add an address').not().isEmpty(),
      check('address.city', 'Please add a city').not().isEmpty(),
      check('contact.phone', 'Please add a contact phone').not().isEmpty(),
    ],
  ],
  restaurantController.createRestaurant
);

router.put(
  '/:id',
  [
    auth.protect,
    auth.authorize('restaurant_owner', 'admin'),
    [
      check('name', 'Please add a name').not().isEmpty(),
      check('description', 'Please add a description').not().isEmpty(),
      check('cuisineType', 'Please add a cuisine type').not().isEmpty(),
    ],
  ],
  restaurantController.updateRestaurant
);

router.delete(
  '/:id',
  [auth.protect, auth.authorize('restaurant_owner', 'admin')],
  restaurantController.deleteRestaurant
);

// Get restaurants within radius
router.get(
  '/radius/:zipcode/:distance',
  restaurantController.getRestaurantsInRadius
);

module.exports = router;
