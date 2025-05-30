import { Document, Model, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  type: 'recipe' | 'restaurant' | 'menu';
  icon: string;
  image: string;
  parent: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryMethods {
  updateIcon(newIcon: string): void;
  updateImage(newImage: string): void;
}

export type CategoryModel = Model<ICategory, {}, ICategoryMethods>;

export interface ICategoryWithChildren extends ICategory {
  children?: ICategory[];
}
