import mongoose, { Document, Schema, Types } from 'mongoose';
import { IRestaurant } from './restaurant.model';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  restaurant: Types.ObjectId | IRestaurant;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, 'A menu item must have a name'],
      trim: true,
      maxlength: [100, 'A menu item name must have less or equal than 100 characters'],
      minlength: [3, 'A menu item name must have more or equal than 3 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    price: {
      type: Number,
      required: [true, 'A menu item must have a price'],
      min: [0, 'Price must be a positive number']
    },
    image: {
      type: String,
      default: 'default-menu-item.jpg'
    },
    category: {
      type: String,
      required: [true, 'Please specify the category of the menu item'],
      enum: {
        values: ['appetizer', 'main', 'dessert', 'beverage', 'side'],
        message: 'Category is either: appetizer, main, dessert, beverage, or side'
      }
    },
    isVegetarian: {
      type: Boolean,
      default: false
    },
    isVegan: {
      type: Boolean,
      default: false
    },
    isGlutenFree: {
      type: Boolean,
      default: false
    },
    isSpicy: {
      type: Boolean,
      default: false
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'A menu item must belong to a restaurant']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
menuItemSchema.index({ name: 1, restaurant: 1 }, { unique: true });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ isVegetarian: 1 });
menuItemSchema.index({ isVegan: 1 });
menuItemSchema.index({ isGlutenFree: 1 });
menuItemSchema.index({ isSpicy: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ category: 1 });

const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);

export default MenuItem;
