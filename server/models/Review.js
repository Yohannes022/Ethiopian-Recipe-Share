const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant',
      required: [
        function () {
          return !this.menuItem;
        },
        'Review must belong to a restaurant or a menu item',
      ],
    },
    menuItem: {
      type: mongoose.Schema.ObjectId,
      ref: 'Menu',
      required: [
        function () {
          return !this.restaurant;
        },
        'Review must belong to a restaurant or a menu item',
      ],
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    foodRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    serviceRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    ambianceRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    valueForMoney: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    isRecommended: {
      type: Boolean,
      default: true,
    },
    order: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate reviews from the same user for the same restaurant/menu item
ReviewSchema.index(
  { user: 1, restaurant: 1, menuItem: 1 },
  { unique: true, partialFilterExpression: { menuItem: { $exists: false } } }
);

// Add text index for search functionality
ReviewSchema.index({ comment: 'text' });

// Static method to get average rating
ReviewSchema.statics.getAverageRating = async function (restaurantId, menuItemId) {
  const obj = {};
  
  if (restaurantId) {
    obj.restaurant = restaurantId;
  } else if (menuItemId) {
    obj.menuItem = menuItemId;
  }
  
  const stats = await this.aggregate([
    {
      $match: obj,
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        averageFoodRating: { $avg: '$foodRating' },
        averageServiceRating: { $avg: '$serviceRating' },
        averageAmbianceRating: { $avg: '$ambianceRating' },
        averageValueForMoney: { $avg: '$valueForMoney' },
      },
    },
  ]);

  try {
    if (restaurantId) {
      await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
        averageRating: stats[0]?.averageRating || 0,
        numReviews: stats[0]?.totalReviews || 0,
      });
    } else if (menuItemId) {
      await this.model('Menu').findByIdAndUpdate(menuItemId, {
        averageRating: stats[0]?.averageRating || 0,
        numReviews: stats[0]?.totalReviews || 0,
      });
    }
  } catch (err) {
    console.error('Error updating average rating:', err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
  if (this.restaurant) {
    this.constructor.getAverageRating(this.restaurant);
  } else if (this.menuItem) {
    this.constructor.getAverageRating(null, this.menuItem);
  }
});

// Call getAverageRating after remove
ReviewSchema.post('remove', function () {
  if (this.restaurant) {
    this.constructor.getAverageRating(this.restaurant);
  } else if (this.menuItem) {
    this.constructor.getAverageRating(null, this.menuItem);
  }
});

// Populate user and restaurant data when querying
ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name profileImage',
  }).populate({
    path: 'restaurant',
    select: 'name',
  });
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
