import { Document, Model, Types } from 'mongoose';

// Type for the type field
export type FavoriteType = 'recipe' | 'restaurant' | 'menu';

// Mongoose document interface
export interface IFavorite extends Document {
  user: Types.ObjectId;
  type: FavoriteType;
  itemId: Types.ObjectId;
  createdAt: Date;
}

// Methods interface
export interface IFavoriteMethods {
  updateType(newType: FavoriteType): void;
}

// Model type
export type FavoriteModel = Model<IFavorite, {}, IFavoriteMethods>;

// Response interface with enriched data
export interface IFavoriteResponse {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: FavoriteType;
  itemId: Types.ObjectId;
  createdAt: Date;
  userDetails?: {
    name: string;
    photo: string;
  };
  item?: {
    _id: Types.ObjectId;
    name: string;
    image?: string;
  };
}
