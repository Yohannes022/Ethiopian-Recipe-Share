const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Review = require('../models/Review');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');
const geocoder = require('../utils/geocoder');
const path = require('path');
const fs = require('fs');
const { uploadFile, deleteFile } = require('../middleware/upload');

// @desc    Calculate distance between two points in miles or kilometers
const calculateDistance = (lat1, lon1, lat2, lon2, unit = 'mi') => {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + 
             Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  
  if (dist > 1) dist = 1;
  
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515; // in miles
  
  if (unit === 'km') dist *= 1.609344; // convert to kilometers
  
  return dist;
};

// @desc    Get all restaurants with advanced filtering, sorting, and pagination
// @route   GET /api/v1/restaurants
// @access  Public
exports.getRestaurants = asyncHandler(async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'near', 'radius', 'unit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|regex)\b/g, match => `$${match}`);

    // Handle text search
    if (req.query.search) {
      const search = req.query.search;
      delete reqQuery.search;
      queryStr = JSON.stringify({
        ...JSON.parse(queryStr),
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { 'cuisineType': { $regex: search, $options: 'i' } },
          { 'address.city': { $regex: search, $options: 'i' } },
          { 'address.state': { $regex: search, $options: 'i' } },
        ]
      });
    }

    // Handle location-based search
    let locationQuery = {};
    if (req.query.near) {
      const loc = await geocoder.geocode(req.query.near);
      const lat = loc[0].latitude;
      const lng = loc[0].longitude;
      const radius = req.query.radius || 10; // Default 10 miles
      const unit = req.query.unit || 'mi';
      
      // Calculate distance using $geoWithin (MongoDB geospatial query)
      locationQuery = {
        'location.coordinates': {
          $geoWithin: {
            $centerSphere: [
              [lng, lat],
              unit === 'mi' ? radius / 3963.2 : radius / 6378.1
            ]
          }
        }
      };
      
      // Add distance calculation for each result
      query = query.find({
        ...JSON.parse(queryStr),
        ...locationQuery
      }).select('+location');
    } else {
      query = Restaurant.find(JSON.parse(queryStr));
    }
    
    // Populate reviews and calculate average rating
    query = query.populate({
      path: 'reviews',
      select: 'rating',
      options: { limit: 5, sort: { createdAt: -1 } }
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Restaurant.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query with pagination
    const restaurants = await query
      .skip(startIndex)
      .limit(limit)
      .lean(); // Convert to plain JavaScript objects

    // Calculate distances and add to results if location-based search
    if (req.query.near) {
      const loc = await geocoder.geocode(req.query.near);
      const lat = loc[0].latitude;
      const lng = loc[0].longitude;
      const unit = req.query.unit || 'mi';
      
      restaurants.forEach(restaurant => {
        if (restaurant.location?.coordinates) {
          restaurant.distance = calculateDistance(
            lat,
            lng,
            restaurant.location.coordinates[1],
            restaurant.location.coordinates[0],
            unit
          ).toFixed(1);
          restaurant.distanceUnit = unit;
        }
      });
      
      // Sort by distance if location-based search
      restaurants.sort((a, b) => a.distance - b.distance);
    }

    // Calculate average rating for each restaurant
    restaurants.forEach(restaurant => {
      if (restaurant.reviews && restaurant.reviews.length > 0) {
        const totalRating = restaurant.reviews.reduce((sum, review) => sum + review.rating, 0);
        restaurant.averageRating = (totalRating / restaurant.reviews.length).toFixed(1);
      } else {
        restaurant.averageRating = 0;
      }
      
      // Remove reviews from the response to keep it lightweight
      delete restaurant.reviews;
    });

    // Pagination result
    const totalCount = await Restaurant.countDocuments({
      ...JSON.parse(queryStr),
      ...locationQuery
    });
    
    const pagination = {};

    if (endIndex < totalCount) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total: totalCount,
      pagination,
      data: restaurants
    });
  } catch (err) {
    logger.error(`Get restaurants error: ${err.message}`, { error: err.stack });
    next(new ErrorResponse('Server error', 500));
  }
});

// @desc    Get single restaurant with detailed information
// @route   GET /api/v1/restaurants/:id
// @access  Public
exports.getRestaurant = asyncHandler(async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate({
        path: 'owner',
        select: 'name email profileImage'
      })
      .populate({
        path: 'menu',
        match: { isAvailable: true },
        options: { sort: { category: 1, name: 1 } }
      })
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name profileImage'
        },
        options: { sort: { createdAt: -1 }, limit: 5 }
      });

    if (!restaurant) {
      return next(
        new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
      );
    }

    // Calculate average rating
    if (restaurant.reviews && restaurant.reviews.length > 0) {
      const totalRating = restaurant.reviews.reduce((sum, review) => sum + review.rating, 0);
      restaurant.averageRating = (totalRating / restaurant.reviews.length).toFixed(1);
      
      // Add rating distribution
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      restaurant.reviews.forEach(review => {
        ratingCounts[review.rating]++;
      });
      
      restaurant.ratingDistribution = ratingCounts;
    } else {
      restaurant.averageRating = 0;
      restaurant.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }

    // Get similar restaurants (same cuisine type)
    if (restaurant.cuisineType && restaurant.cuisineType.length > 0) {
      const similarRestaurants = await Restaurant.find({
        _id: { $ne: restaurant._id },
        cuisineType: { $in: restaurant.cuisineType },
        isActive: true
      })
        .select('name images cuisineType averageRating')
        .limit(4);
      
      restaurant.similarRestaurants = similarRestaurants;
    }

    // Calculate distance if location is provided
    if (req.query.lat && req.query.lng) {
      const { lat, lng, unit = 'mi' } = req.query;
      
      if (restaurant.location?.coordinates) {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          restaurant.location.coordinates[1],
          restaurant.location.coordinates[0],
          unit
        );
        
        restaurant.distance = parseFloat(distance.toFixed(1));
        restaurant.distanceUnit = unit;
      }
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (err) {
    logger.error(`Get restaurant error: ${err.message}`, { error: err.stack });
    next(new ErrorResponse('Server error', 500));
  }
});

// Note: Legacy getRestaurant function removed - using the enhanced version above

// @desc    Create new restaurant
// @route   POST /api/v1/restaurants
// @access  Private (Restaurant Owner or Admin)
exports.createRestaurant = asyncHandler(async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.owner = req.user.id;

    // Check for published restaurant
    const publishedRestaurant = await Restaurant.findOne({ owner: req.user.id });

    // If the user is not an admin, they can only add one restaurant
    if (publishedRestaurant && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `The user with ID ${req.user.id} has already published a restaurant`,
          400
        )
      );
    }

    // Geocode the address
    const loc = await geocoder.geocode(req.body.address);
    
    const restaurantData = {
      ...req.body,
      location: {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName || '',
        city: loc[0].city || '',
        state: loc[0].stateCode || '',
        zipcode: loc[0].zipcode || '',
        country: loc[0].countryCode || '',
      },
      // Don't save address in DB as it's now in location
      address: undefined,
    };

    const restaurant = await Restaurant.create(restaurantData);

    // Add the restaurant to the user's restaurants array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { restaurants: restaurant._id } },
      { new: true, runValidators: true }
    );

    logger.info(`New restaurant created: ${restaurant._id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (err) {
    logger.error(`Create restaurant error: ${err.message}`, { error: err.stack });
    next(new ErrorResponse('Server error', 500));
  }
});

// @desc    Update restaurant
// @route   PUT /api/v1/restaurants/:id
// @access  Private (Restaurant Owner or Admin)
exports.updateRestaurant = asyncHandler(async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return next(
        new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is restaurant owner or admin
    if (
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this restaurant`,
          403
        )
      );
    }

    // If address is being updated, geocode the new address
    if (req.body.address) {
      const loc = await geocoder.geocode(req.body.address);
      
      req.body.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName || '',
        city: loc[0].city || '',
        state: loc[0].stateCode || '',
        zipcode: loc[0].zipcode || '',
        country: loc[0].countryCode || '',
      };
      
      // Don't save address in DB as it's now in location
      req.body.address = undefined;
    }

    // Update the restaurant
    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info(`Restaurant updated: ${restaurant._id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (err) {
    logger.error(`Update restaurant error: ${err.message}`, { error: err.stack });
    next(new ErrorResponse('Server error', 500));
  }
});

// @desc    Delete restaurant
// @route   DELETE /api/v1/restaurants/:id
// @access  Private (Restaurant Owner or Admin)
exports.deleteRestaurant = asyncHandler(async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return next(
        new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is restaurant owner or admin
    if (
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this restaurant`,
          403
        )
      );
    }

    // Delete all menu items associated with this restaurant
    await Menu.deleteMany({ restaurant: restaurant._id });
    
    // Delete all reviews associated with this restaurant
    await Review.deleteMany({ restaurant: restaurant._id });

    // Remove restaurant from user's restaurants array
    await User.findByIdAndUpdate(
      restaurant.owner,
      { $pull: { restaurants: restaurant._id } },
      { new: true, runValidators: true }
    );

    // Delete restaurant images from storage
    if (restaurant.images && restaurant.images.length > 0) {
      const deletePromises = restaurant.images.map(image => 
        deleteFile(image.key)
      );
      await Promise.all(deletePromises);
    }

    // Finally, delete the restaurant
    await restaurant.remove();

    logger.info(`Restaurant deleted: ${req.params.id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    logger.error(`Delete restaurant error: ${err.message}`, { error: err.stack });
    next(new ErrorResponse('Server error', 500));
  }
});

// @desc    Upload photo for restaurant
// @route   PUT /api/v1/restaurants/:id/photo
// @access  Private (Restaurant Owner or Admin)
exports.uploadRestaurantPhoto = asyncHandler(async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return next(
        new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is restaurant owner or admin
    if (
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this restaurant`,
          401
        )
      );
    }

    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Check if the file is an image
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check file size
    const maxSize = process.env.MAX_FILE_UPLOAD || 1000000;
    if (file.size > maxSize) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${parseInt(maxSize) / 1000}KB`,
          400
        )
      );
    }

    // Create custom filename
    file.name = `photo_${restaurant._id}${path.parse(file.name).ext}`;

    // Upload file to S3 or local storage
    const result = await uploadFile(file);

    // Add image to restaurant
    restaurant.images = restaurant.images || [];
    restaurant.images.push({
      url: result.Location || `/uploads/${file.name}`,
      key: result.Key || file.name,
      isPrimary: restaurant.images.length === 0, // Set as primary if first image
    });

    await restaurant.save();

    res.status(200).json({
      success: true,
      data: restaurant.images,
    });
  } catch (err) {
    logger.error(`Upload restaurant photo error: ${err.message}`, { error: err.stack });
    next(new ErrorResponse('Problem with file upload', 500));
  }
});

// @desc    Delete restaurant photo
// @route   DELETE /api/v1/restaurants/:id/photo/:photoId
// @access  Private (Restaurant Owner or Admin)
exports.deleteRestaurantPhoto = asyncHandler(async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return next(
        new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is restaurant owner or admin
    if (
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this restaurant`,
          401
        )
      );
    }

    const photoIndex = restaurant.images.findIndex(
      (img) => img._id.toString() === req.params.photoId
    );

    if (photoIndex === -1) {
      return next(new ErrorResponse(`Photo not found`, 404));
    }

    const photo = restaurant.images[photoIndex];

    // Delete file from storage
    await deleteFile(photo.key);

    // Remove image from array
    restaurant.images.splice(photoIndex, 1);

    // If we deleted the primary image and there are other images, set the first one as primary
    if (photo.isPrimary && restaurant.images.length > 0) {
      restaurant.images[0].isPrimary = true;
    }

    await restaurant.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    logger.error(`Delete restaurant photo error: ${err.message}`, { error: err.stack });
    next(new ErrorResponse('Problem deleting photo', 500));
  }
});

// @desc    Get restaurants within a radius
// @route   GET /api/v1/restaurants/radius/:zipcode/:distance/:unit?
// @access  Public
exports.getRestaurantsInRadius = asyncHandler(async (req, res, next) => {
  try {
    const { zipcode, distance, unit = 'mi' } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const restaurants = await Restaurant.find({
      'location.coordinates': {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
      isActive: true,
    });

    // Add distance to each restaurant
    const restaurantsWithDistance = restaurants.map(restaurant => {
      const distance = calculateDistance(
        lat,
        lng,
        restaurant.location.coordinates[1],
        restaurant.location.coordinates[0],
        unit
      );
      
      return {
        ...restaurant.toObject(),
        distance: parseFloat(distance.toFixed(1)),
        distanceUnit: unit,
      };
    });

    // Sort by distance
    restaurantsWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      count: restaurantsWithDistance.length,
      data: restaurantsWithDistance,
    });
  } catch (err) {
    logger.error(`Get restaurants in radius error: ${err.message}`, { error: err.stack });
    next(new ErrorResponse('Server error', 500));
  }
});

// @desc    Get restaurant statistics
// @route   GET /api/v1/restaurants/stats
// @access  Private (Admin)
exports.getRestaurantStats = asyncHandler(async (req, res, next) => {
  try {
    const stats = await Restaurant.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'restaurant',
          as: 'reviews',
        },
      },
      {
        $lookup: {
          from: 'menus',
          localField: '_id',
          foreignField: 'restaurant',
          as: 'menuItems',
        },
      },
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 },
          avgRating: { $avg: { $avg: '$reviews.rating' } },
          avgMenuItems: { $avg: { $size: '$menuItems' } },
          minPrice: { $min: '$menuItems.price' },
          maxPrice: { $max: '$menuItems.price' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    logger.error(`Get restaurant stats error: ${err.message}`, { error: err.stack });
    next(new ErrorResponse('Server error', 500));
  }
});

// @desc    Get restaurants by owner
// @route   GET /api/v1/restaurants/owner/:ownerId
// @access  Private (Admin or Owner)
exports.getRestaurantsByOwner = asyncHandler(async (req, res, next) => {
  try {
    // Check if user is admin or the owner
    if (req.params.ownerId !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view these restaurants`,
          403
        )
      );
    }

    const restaurants = await Restaurant.find({ owner: req.params.ownerId })
      .select('name images cuisineType averageRating isActive createdAt')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (err) {
    logger.error(`Get restaurants by owner error: ${err.message}`, { error: err.stack });
    next(new ErrorResponse('Server error', 500));
  }
});

// @desc    Get restaurants within a radius (legacy route)
// @route   GET /api/restaurants/radius/:zipcode/:distance
// @access  Public
exports.getRestaurantsInRadiusLegacy = async (req, res, next) => {
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
