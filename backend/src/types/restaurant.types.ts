import { Document, Model, Types } from 'mongoose';
import { IMenuItem } from './menuItem.types';
import { IReview } from './review.types';

export interface IOpeningHours {
  opens: string;
  closes: string;
  days: string[];
}

export interface ILocation {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: [number, number];
}

export interface IRestaurant extends Document {
  name: string;
  description: string;
  cuisine: string[];
  category: Types.ObjectId;
  owner: Types.ObjectId;
  location: ILocation;
  openingHours: IOpeningHours[];
  phone: string;
  email: string;
  website: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  menu: Types.ObjectId[];
  reviews: Types.ObjectId[];
  rating: number;
  images: string[];
  videos: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  ownerInfo?: {
    name: string;
    photo: string;
  };
  categoryInfo?: {
    name: string;
  };
  reviewsInfo?: IReview[];
}

// Virtual properties
export interface IRestaurantVirtuals {
  ownerInfo?: {
    name: string;
    photo: string;
  };
  categoryInfo?: {
    name: string;
  };
  reviewsInfo?: IReview[];
  menuItems?: IMenuItem[];
}

export interface IRestaurantMethods {
  calculateRating(): void;
  addMenuItem(menuItemId: Types.ObjectId): void;
  removeMenuItem(menuItemId: Types.ObjectId): void;
  updateOpeningHours(days: string[], opens: string, closes: string): void;
}

export type RestaurantModel = Model<IRestaurant, {}, IRestaurantMethods>;
