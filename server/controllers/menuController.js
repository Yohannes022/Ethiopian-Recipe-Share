const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const { validationResult } = require('express-validator');

// @desc    Get all menu items for a restaurant
// @route   GET /api/menu/restaurant/:restaurantId
// @access  Public
exports.getMenuItems = async (req, res, next) => {
  try {
    const menuItems = await Menu.find({ restaurant: req.params.restaurantId });
    
    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.json({ success: true, data: menuItem });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private (Restaurant Owner or Admin)
exports.createMenuItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Make sure user is restaurant owner or admin
    if (
      restaurant.owner.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to add menu items to this restaurant',
      });
    }

    const menuItem = await Menu.create(req.body);

    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Restaurant Owner or Admin)
exports.updateMenuItem = async (req, res, next) => {
  try {
    let menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    // Get restaurant to check ownership
    const restaurant = await Restaurant.findById(menuItem.restaurant);

    // Make sure user is restaurant owner or admin
    if (
      restaurant.owner.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this menu item',
      });
    }

    menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: menuItem });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Restaurant Owner or Admin)
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    // Get restaurant to check ownership
    const restaurant = await Restaurant.findById(menuItem.restaurant);

    // Make sure user is restaurant owner or admin
    if (
      restaurant.owner.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this menu item',
      });
    }

    await menuItem.remove();

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Search menu items
// @route   GET /api/menu/search
// @access  Public
exports.searchMenuItems = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query',
      });
    }

    const menuItems = await Menu.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('restaurant', 'name');

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    console.error('Search menu items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
