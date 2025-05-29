import { Document, Types } from 'mongoose';

export enum UserRole {
  USER = 'user',
  RESTAURANT_OWNER = 'restaurant_owner',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  DELIVERY = 'delivery',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export interface IAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  formattedAddress?: string;
  phone?: string;
}

export interface ISocialMedia {
  platform: string;
  url: string;
  username?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  photo?: string;
  role: UserRole;
  status: UserStatus;
  addresses: IAddress[];
  favorites: Types.ObjectId[];
  orders: Types.ObjectId[];
  restaurants: Types.ObjectId[];
  reviews: Types.ObjectId[];
  socialMedia?: ISocialMedia[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginCount: number;
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    dietaryRestrictions?: string[];
    favoriteCuisines?: string[];
  };
  stats?: {
    ordersCount: number;
    reviewsCount: number;
    restaurantsCount: number;
    favoritesCount: number;
    totalSpent: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
  createEmailVerificationToken(): string;
}

export interface IUserMethods {
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
  createEmailVerificationToken(): string;
}

export interface UserModel extends mongoose.Model<IUser> {
  // Static methods can be defined here if needed
}
