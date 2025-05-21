const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const { validationResult } = require('express-validator');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res, next) => {
  try {
    // Build query object
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Restaurant.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Restaurant.countDocuments(JSON.parse(queryStr));

    query = query.skip(skip).limit(limit);

    const restaurants = await query;

    res.json({
      success: true,
      count: restaurants.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: restaurants,
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('reviews');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private (Restaurant Owner or Admin)
exports.createRestaurant = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add user to req.body
    req.body.owner = req.user.id;

    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Restaurant Owner or Admin)
exports.updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

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
        message: 'Not authorized to update this restaurant',
      });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Restaurant Owner or Admin)
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

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
        message: 'Not authorized to delete this restaurant',
      });
    }

    await restaurant.remove();

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get restaurants within a radius
// @route   GET /api/restaurants/radius/:zipcode/:distance
// @access  Public
exports.getRestaurantsInRadius = async (req, res, next) => {
  try {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide distance by radius of Earth (3,963 mi / 6,378 km)
    const radius = distance / 3963;

    const restaurants = await Restaurant.find({
      'address.coordinates': {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error('Get restaurants in radius error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
