const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');
const slugify = require('slugify');

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    cuisineType: {
      type: [String],
      required: [true, 'Please add at least one cuisine type'],
      enum: [
        'Ethiopian',
        'African',
        'Vegetarian',
        'Vegan',
        'Gluten-Free',
        'International',
        'Fusion',
      ],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    contact: {
      phone: {
        type: String,
        match: [/^[\d\-\+\(\)\s]+$/, 'Please add a valid phone number'],
      },
      email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email',
        ],
      },
      website: {
        type: String,
        match: [
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
          'Please use a valid URL with HTTP or HTTPS',
        ],
      },
    },
    hours: {
      monday: { open: Number, close: Number },
      tuesday: { open: Number, close: Number },
      wednesday: { open: Number, close: Number },
      thursday: { open: Number, close: Number },
      friday: { open: Number, close: Number },
      saturday: { open: Number, close: Number },
      sunday: { open: Number, close: Number },
    },
    priceRange: {
      type: Number,
      min: 1,
      max: 4,
      default: 2,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    deliveryAvailable: {
      type: Boolean,
      default: false,
    },
    takeoutAvailable: {
      type: Boolean,
      default: true,
    },
    dineInAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    menu: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Menu',
      },
    ],
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: 'Restaurant image',
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create restaurant slug from the name
RestaurantSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode & create location field
RestaurantSchema.pre('save', async function (next) {
  if (!this.isModified('address')) {
    return next();
  }

  try {
    const loc = await geocoder.geocode(this.address);
    this.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName || '',
      city: loc[0].city || '',
      state: loc[0].stateCode || '',
      zipcode: loc[0].zipcode || '',
      country: loc[0].countryCode || '',
    };

    // Do not save address in DB
    this.address = undefined;
    next();
  } catch (err) {
    console.error('Error geocoding address:', err);
    next(err);
  }
});

// Cascade delete menu items when a restaurant is deleted
RestaurantSchema.pre('remove', async function (next) {
  await this.model('Menu').deleteMany({ restaurant: this._id });
  await this.model('Review').deleteMany({ restaurant: this._id });
  next();
});

// Reverse populate with virtuals
RestaurantSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'restaurant',
  justOne: false,
});

// Static method to get average rating and save
RestaurantSchema.statics.getAverageRating = async function (restaurantId) {
  const obj = await this.aggregate([
    {
      $match: { _id: restaurantId },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'restaurant',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' },
        numReviews: { $size: '$reviews' },
      },
    },
  ]);

  try {
    await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
      averageRating: obj[0]?.averageRating || 0,
      numReviews: obj[0]?.numReviews || 0,
    });
  } catch (err) {
    console.error('Error updating restaurant rating:', err);
  }
};

// Call getAverageRating after save or delete review
RestaurantSchema.post('save', function () {
  this.constructor.getAverageRating(this._id);
});

RestaurantSchema.post('remove', function () {
  this.constructor.getAverageRating(this._id);
});

// Create geospatial index
RestaurantSchema.index({ location: '2dsphere' });

// Create text index for search
RestaurantSchema.index({
  name: 'text',
  description: 'text',
  'location.formattedAddress': 'text',
  cuisineType: 'text',
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
