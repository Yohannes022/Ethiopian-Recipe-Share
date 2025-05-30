import mongoose, { Schema, Document, Types } from 'mongoose';
import { IReviewBase } from '../types/review.types';
import { IRestaurant } from '../types/restaurant.types';

// Define interfaces for methods
interface IRestaurantMethods {
  calculateRating(): Promise<void>;
  addMenuItem(menuItemId: mongoose.Types.ObjectId): Promise<void>;
  removeMenuItem(menuItemId: mongoose.Types.ObjectId): Promise<void>;
  addOpeningHours(days: string[], opens: string, closes: string): Promise<void>;
  removeOpeningHours(hours: mongoose.Types.ObjectId): Promise<void>;
}

// Extend mongoose.Document with our schema fields
interface IRestaurantDocument extends mongoose.Document {
  name: string;
  description: string;
  cuisine: string[];
  category: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  location: {
    address: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
    coordinates: number[];
  };
  openingHours: Array<{
    days: string[];
    opens: string;
    closes: string;
  }>;
  phone: string;
  email: string;
  website?: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  reviews: mongoose.Types.ObjectId[];
  rating: number;
  menu: mongoose.Types.ObjectId[];
  images: string[];
  videos: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const restaurantSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Restaurant must have a name'],
    trim: true,
    minlength: [3, 'Restaurant name must be at least 3 characters'],
    maxlength: [100, 'Restaurant name must not exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Restaurant must have a description'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description must not exceed 500 characters'],
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
      required: [true, 'Restaurant must have a zip code'],
      trim: true,
    },
    coordinates: {
      type: [Number],
      required: [true, 'Restaurant must have coordinates'],
    },
  },
  openingHours: [{
    days: {
      type: [String],
      required: [true, 'Opening hours must have days'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'Opening hours must have at least one day',
      },
    },
    opens: {
      type: String,
      required: [true, 'Opening hours must have opening time'],
      validate: {
        validator: function (v: string) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Opening time must be in 24-hour format (HH:mm)',
      },
    },
    closes: {
      type: String,
      required: [true, 'Opening hours must have closing time'],
      validate: {
        validator: function (v: string) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Closing time must be in 24-hour format (HH:mm)',
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
    required: [true, 'Restaurant must have an email'],
    trim: true,
    validate: {
      validator: function (v: string) {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please provide a valid email address',
    },
  },
  website: {
    type: String,
    trim: true,
  },
  socialMedia: {
    facebook: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
    },
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    default: [],
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  menu: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
  }],
  images: [{
    type: String,
    trim: true,
  }],
  videos: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Add methods to the schema
restaurantSchema.methods.calculateRating = async function (this: mongoose.Document & IRestaurantDocument & IRestaurantMethods) {
  if (this.reviews.length === 0) {
    this.rating = 0;
    return;
  }

  // Populate the reviews to get the actual review documents
  const populatedReviews = await this.populate('reviews');
  const reviews = populatedReviews.reviews as unknown as mongoose.Types.Array<mongoose.Document & IReviewBase>;

  const totalRating = reviews.reduce((sum: number, review: mongoose.Document & IReviewBase) => {
    return sum + (review.get('rating') as number || 0);
  }, 0);

  this.rating = totalRating / reviews.length;
};

restaurantSchema.methods.addMenuItem = async function (this: mongoose.Document & IRestaurantDocument & IRestaurantMethods, menuItemId: mongoose.Types.ObjectId) {
  this.menu.push(menuItemId);
  await this.save();
};

restaurantSchema.methods.removeMenuItem = async function (this: mongoose.Document & IRestaurantDocument & IRestaurantMethods, menuItemId: mongoose.Types.ObjectId) {
  this.menu = this.menu.filter((item: mongoose.Types.ObjectId) => item.toString() !== menuItemId.toString());
  await this.save();
};

restaurantSchema.methods.addOpeningHours = async function (this: mongoose.Document & IRestaurantDocument & IRestaurantMethods, days: string[], opens: string, closes: string) {
  this.openingHours.push({ days, opens, closes });
  await this.save();
};

restaurantSchema.methods.removeOpeningHours = async function (this: mongoose.Document & IRestaurantDocument & IRestaurantMethods, hours: mongoose.Types.ObjectId) {
  this.openingHours = this.openingHours.filter((hour: { days: string[], opens: string, closes: string }) => hour.days.toString() !== hours.toString());
  await this.save();
};

// Create and export the model
const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema) as mongoose.Model<IRestaurantDocument> & mongoose.Model<IRestaurant>;

export default Restaurant;