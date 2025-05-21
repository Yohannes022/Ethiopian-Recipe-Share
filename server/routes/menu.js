const express = require('express');
const { check } = require('express-validator');
const menuController = require('../controllers/menuController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/restaurant/:restaurantId', menuController.getMenuItems);
router.get('/:id', menuController.getMenuItem);
router.get('/search', menuController.searchMenuItems);

// Protected routes (require authentication)
router.use(auth.protect);

// Routes that require restaurant owner or admin role
router.post(
  '/',
  [
    auth.authorize('restaurant_owner', 'admin'),
    [
      check('name', 'Please add a name').not().isEmpty(),
      check('price', 'Please add a price').isNumeric(),
      check('category', 'Please add a category').not().isEmpty(),
      check('restaurant', 'Please select a restaurant').not().isEmpty(),
    ],
  ],
  menuController.createMenuItem
);

router.put(
  '/:id',
  [
    auth.authorize('restaurant_owner', 'admin'),
    [
      check('name', 'Please add a name').not().isEmpty(),
      check('price', 'Please add a valid price').optional().isNumeric(),
    ],
  ],
  menuController.updateMenuItem
);

router.delete(
  '/:id',
  auth.authorize('restaurant_owner', 'admin'),
  menuController.deleteMenuItem
);

module.exports = router;
