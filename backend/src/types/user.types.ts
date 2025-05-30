import { Document, Model, Types } from 'mongoose';

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  location?: {
    type: string;
    coordinates: number[];
    formattedAddress?: string;
  };
}

export interface ISocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface INotificationPreferences {
  email: boolean;
  push: boolean;
}

export interface IUserPreferences {
  notifications: INotificationPreferences;
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
}

export interface IUser extends Document<Types.ObjectId> {
  name: string;
  email: string;
  photo?: string;
  role: 'user' | 'chef' | 'restaurant_owner' | 'admin';
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  phoneNumber?: string;
  address?: IAddress;
  bio?: string;
  socialMedia?: ISocialMedia;
  preferences: IUserPreferences;
  lastLogin?: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  recipes?: Types.ObjectId[];
  reviews?: Types.ObjectId[];
}

export interface IUserMethods {
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
  createEmailVerificationToken(): string;
}

export type UserModel = Model<IUser, {}, IUserMethods>;
