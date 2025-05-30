import mongoose, { Schema, Document, Model } from 'mongoose';
import { IRestaurant, IRestaurantMethods, RestaurantModel } from '@/types/restaurant.types';

const restaurantSchema = new mongoose.Schema<IRestaurant, RestaurantModel, IRestaurantMethods>(
  {
    name: {
      type: String,
      required: [true, 'Restaurant must have a name'],
      trim: true,
      maxlength: [100, 'Restaurant name must be less than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Restaurant must have a description'],
      trim: true,
    },
    cuisine: {
      type: [String],
      required: [true, 'Restaurant must have cuisine types'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Restaurant must belong to a category'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Restaurant must have an owner'],
    },
    location: {
      address: {
        type: String,
        required: [true, 'Restaurant must have an address'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Restaurant must have a city'],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Restaurant must have a country'],
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      coordinates: {
        type: [Number],
        required: [true, 'Restaurant must have coordinates'],
        index: '2dsphere',
      },
    },
    openingHours: [{
      days: {
        type: [String],
        required: [true, 'Opening hours must have days'],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      opens: {
        type: String,
        required: [true, 'Opening hours must have opening time'],
        validate: {
          validator: function (v: string) {
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: 'Opening time must be in HH:MM format',
        },
      },
      closes: {
        type: String,
        required: [true, 'Opening hours must have closing time'],
        validate: {
          validator: function (v: string) {
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: 'Closing time must be in HH:MM format',
        },
      },
    }],
    phone: {
      type: String,
      required: [true, 'Restaurant must have a phone number'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Restaurant must have an email address'],
      trim: true,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, // eslint-disable-line
        'Please provide a valid email address',
      ],
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+/i.test(v);
        },
        message: 'Website must start with http:// or https://',
      },
    },
    socialMedia: {
      facebook: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string) {
            return /^https?:\/\/facebook\.com\/.+/i.test(v);
          },
          message: 'Facebook URL must be a valid Facebook profile URL',
        },
      },
      twitter: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string) {
            return /^https?:\/\/twitter\.com\/.+/i.test(v);
          },
          message: 'Twitter URL must be a valid Twitter profile URL',
        },
      },
      instagram: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string) {
            return /^https?:\/\/instagram\.com\/.+/i.test(v);
          },
          message: 'Instagram URL must be a valid Instagram profile URL',
        },
      },
    },
    menu: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
    }],
    images: [{
      type: String,
      required: [true, 'Restaurant must have at least one image'],
    }],
    video: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+/i.test(v);
        },
        message: 'Video URL must be a valid URL',
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be more than 5'],
    },
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    }],
    featured: {
      type: Boolean,
      default: false,
    },
    private: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
restaurantSchema.index({ name: 'text', description: 'text', cuisine: 'text' });
restaurantSchema.index({ category: 1 });
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ createdAt: -1 });
restaurantSchema.index({ featured: 1 });

// Virtual populate
restaurantSchema.virtual('owner', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id',
  justOne: true,
  select: 'name photo',
});

restaurantSchema.virtual('category', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true,
  select: 'name',
});

// Instance methods
restaurantSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    return;
  }

  const totalRating = this.reviews.reduce((sum, reviewId) => {
    return sum + (reviewId.rating || 0);
  }, 0);

  this.rating = totalRating / this.reviews.length;
};

restaurantSchema.methods.addMenuItem = function (menuItemId: mongoose.Types.ObjectId) {
  if (!this.menu.includes(menuItemId)) {
    this.menu.push(menuItemId);
  }
};

restaurantSchema.methods.removeMenuItem = function (menuItemId: mongoose.Types.ObjectId) {
  this.menu = this.menu.filter((item) => !item.equals(menuItemId));
};

restaurantSchema.methods.updateOpeningHours = function (
  days: string[],
  opens: string,
  closes: string
) {
  const existingHours = this.openingHours.find((hours) =>
    days.every((day) => hours.days.includes(day))
  );

  if (existingHours) {
    existingHours.opens = opens;
    existingHours.closes = closes;
  } else {
    this.openingHours.push({ days, opens, closes });
  }
};

// Pre-save middleware to calculate rating before saving
restaurantSchema.pre('save', function (next) {
  this.calculateRating();
  next();
});

// Create and export the model
const Restaurant = mongoose.model<IRestaurant, RestaurantModel>('Restaurant', restaurantSchema);
export default Restaurant;
