import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  coordinates?: [number, number]; // [longitude, latitude]
  formattedAddress?: string;
}

export interface IWorkingHours {
  day: string;
  isOpen: boolean;
  openTime?: string; // Format: 'HH:MM'
  closeTime?: string; // Format: 'HH:MM'
}

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  description: string;
  cuisine: string[];
  address: IAddress;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  images: string[];
  owner: Types.ObjectId | string;
  rating?: number;
  numReviews?: number;
  priceRange: 1 | 2 | 3 | 4; // $, $$, $$$, $$$$
  isOpen: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  isActive: boolean;
  menuItemsCount: number;
  ordersCount: number;
  averagePreparationTime: number; // in minutes
  deliveryFee: number;
  minimumOrder: number;
  workingHours: IWorkingHours[];
  features: string[];
  dietaryRestrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  street: {
    type: String,
    required: [true, 'Please provide a street address'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Please provide a city'],
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  postalCode: {
    type: String,
    required: [true, 'Please provide a postal code'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Please provide a country'],
    trim: true,
  },
  coordinates: {
    type: [Number],
    index: '2dsphere',
  },
  formattedAddress: String,
});

const workingHoursSchema = new Schema<IWorkingHours>({
  day: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  openTime: {
    type: String,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  closeTime: {
    type: String,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    validate: {
      validator: function (this: IWorkingHours, val: string) {
        return !this.isOpen || (val && this.openTime && val > this.openTime);
      },
      message: 'Close time must be after open time',
    },
  },
});

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, 'A restaurant must have a name'],
      trim: true,
      maxlength: [100, 'A restaurant name must have less or equal than 100 characters'],
      minlength: [2, 'A restaurant name must have more or equal than 2 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'A restaurant must have a description'],
      trim: true,
      maxlength: [2000, 'Description cannot be longer than 2000 characters'],
    },
    cuisine: [{
      type: String,
      required: [true, 'A restaurant must have at least one cuisine type'],
      trim: true,
    }],
    address: {
      type: addressSchema,
      required: [true, 'A restaurant must have an address'],
    },
    phone: {
      type: String,
      required: [true, 'A restaurant must have a phone number'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'A restaurant must have an email'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: 'default-restaurant-logo.jpg',
    },
    coverImage: {
      type: String,
      default: 'default-restaurant-cover.jpg',
    },
    images: [String],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A restaurant must have an owner'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot be more than 5'],
      set: (val: number) => Math.round(val * 10) / 10, // 4.6666 -> 4.7
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    priceRange: {
      type: Number,
      required: [true, 'A restaurant must have a price range'],
      enum: {
        values: [1, 2, 3, 4],
        message: 'Price range is either: 1 ($), 2 ($$), 3 ($$$), or 4 ($$$$)',
      },
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    menuItemsCount: {
      type: Number,
      default: 0,
    },
    ordersCount: {
      type: Number,
      default: 0,
    },
    averagePreparationTime: {
      type: Number,
      default: 30, // in minutes
      min: [0, 'Preparation time must be a positive number'],
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee must be a positive number'],
    },
    minimumOrder: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order must be a positive number'],
    },
    workingHours: {
      type: [workingHoursSchema],
      validate: {
        validator: function (this: IRestaurant, val: IWorkingHours[]) {
          const days = val.map((v) => v.day);
          return new Set(days).size === days.length; // Check for duplicate days
        },
        message: 'Each day can only appear once in working hours',
      },
    },
    features: [{
      type: String,
      trim: true,
    }],
    dietaryRestrictions: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
restaurantSchema.index({ name: 'text', description: 'text', 'address.city': 'text', cuisine: 'text' });
restaurantSchema.index({ 'address.coordinates': '2dsphere' });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ priceRange: 1 });
restaurantSchema.index({ owner: 1 });

// Virtual populate
restaurantSchema.virtual('menuItems', {
  ref: 'MenuItem',
  foreignField: 'restaurant',
  localField: '_id',
});

restaurantSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'restaurant',
  localField: '_id',
});

// Document middleware to create slug
restaurantSchema.pre<IRestaurant>('save', function (next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/--+/g, '-'); // Replace multiple - with single -
  next();
});

// Query middleware to populate owner data
restaurantSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'owner',
    select: 'name email phone',
  });
  next();
});

// Update user's restaurants count when a new restaurant is created
restaurantSchema.post('save', async function (doc) {
  await this.model('User').findByIdAndUpdate(doc.owner, {
    $inc: { restaurantsCount: 1 },
  });
});

// Update user's restaurants count when a restaurant is deleted
restaurantSchema.pre(/^findOneAndDelete/, async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await this.model('User').findByIdAndUpdate(doc.owner, {
      $inc: { restaurantsCount: -1 },
    });
  }
  next();
});

const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);

export default Restaurant;
