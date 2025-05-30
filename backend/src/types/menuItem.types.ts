import { Document, Model, Types } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  restaurant: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuItemMethods {
  updatePrice(newPrice: number): void;
}

export type MenuItemModel = Model<IMenuItem, {}, IMenuItemMethods>;
