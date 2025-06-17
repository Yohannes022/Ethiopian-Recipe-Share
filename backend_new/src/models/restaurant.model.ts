import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy?: boolean;
  isAvailable: boolean;
}

export interface IRestaurant extends Document {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: [number, number];
  };
  phone: string;
  email: string;
  website?: string;
  cuisineType: string[];
  openingHours: {
    monday: { open: boolean; hours: { open: string; close: string } };
    tuesday: { open: boolean; hours: { open: string; close: string } };
    wednesday: { open: boolean; hours: { open: string; close: string } };
    thursday: { open: boolean; hours: { open: string; close: string } };
    friday: { open: boolean; hours: { open: string; close: string } };
    saturday: { open: boolean; hours: { open: string; close: string } };
    sunday: { open: boolean; hours: { open: string; close: string } };
  };
  menu: IMenuItem[];
  owner: mongoose.Types.ObjectId;
  images: string[];
  rating: {
    average: number;
    count: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  deliveryOptions: {
    delivery: boolean;
    pickup: boolean;
    minimumOrder: number;
    deliveryFee: number;
    freeDeliveryOver: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  image: String,
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isGlutenFree: { type: Boolean, default: false },
  isSpicy: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true }
});

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true, default: 'Ethiopia' },
      coordinates: { type: [Number] }
    },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    website: String,
    cuisineType: [{ type: String, required: true }],
    openingHours: {
      monday: {
        open: { type: Boolean, default: true },
        hours: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '21:00' }
        }
      },
      tuesday: {
        open: { type: Boolean, default: true },
        hours: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '21:00' }
        }
      },
      wednesday: {
        open: { type: Boolean, default: true },
        hours: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '21:00' }
        }
      },
      thursday: {
        open: { type: Boolean, default: true },
        hours: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '21:00' }
        }
      },
      friday: {
        open: { type: Boolean, default: true },
        hours: {
          open: { type: String, default: '09:00' },
          close: { type: String, default: '22:00' }
        }
      },
      saturday: {
        open: { type: Boolean, default: true },
        hours: {
          open: { type: String, default: '10:00' },
          close: { type: String, default: '22:00' }
        }
      },
      sunday: {
        open: { type: Boolean, default: true },
        hours: {
          open: { type: String, default: '10:00' },
          close: { type: String, default: '21:00' }
        }
      }
    },
    menu: [menuItemSchema],
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    deliveryOptions: {
      delivery: { type: Boolean, default: true },
      pickup: { type: Boolean, default: true },
      minimumOrder: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      freeDeliveryOver: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
restaurantSchema.index({ name: 'text', description: 'text' });
restaurantSchema.index({ 'address.city': 1 });
restaurantSchema.index({ 'address.coordinates': '2dsphere' });
restaurantSchema.index({ cuisineType: 1 });
restaurantSchema.index({ owner: 1 });

// Virtual for reviews (to be implemented later)
restaurantSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'restaurant'
});

const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);

export default Restaurant;
