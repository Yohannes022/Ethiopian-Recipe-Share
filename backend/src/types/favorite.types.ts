import { Document, Model, Types } from 'mongoose';

export interface IFavorite extends Document {
  user: Types.ObjectId;
  type: 'recipe' | 'restaurant' | 'menu';
  itemId: Types.ObjectId;
  createdAt: Date;
}

export interface IFavoriteMethods {
  updateType(newType: string): void;
}

export type FavoriteModel = Model<IFavorite, {}, IFavoriteMethods>;

export interface IFavoriteWithDetails extends IFavorite {
  user?: {
    name: string;
    photo: string;
  };
  item?: {
    _id: Types.ObjectId;
    name: string;
    image?: string;
  };
}
