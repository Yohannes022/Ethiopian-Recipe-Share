import { Document, Types } from 'mongoose';

export enum FavoriteType {
  RESTAURANT = 'Restaurant',
  MENU_ITEM = 'MenuItem',
  RECIPE = 'Recipe',
}

export interface IFavorite extends Document {
  user: Types.ObjectId | string;
  targetType: FavoriteType;
  target: Types.ObjectId | string;
  metadata?: {
    notes?: string;
    rating?: number;
    tags?: string[];
    customFields?: Record<string, any>;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFavoriteFilters {
  user: Types.ObjectId | string;
  targetType?: FavoriteType | FavoriteType[];
  target?: Types.ObjectId | string;
  isActive?: boolean;
  searchTerm?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface IFavoriteStats {
  totalFavorites: number;
  favoritesByType: Array<{
    type: FavoriteType;
    count: number;
  }>;
  recentFavorites: IFavorite[];
  mostFavoritedItems: Array<{
    target: any;
    count: number;
  }>;
}

export interface IAddFavoriteInput {
  targetType: FavoriteType;
  targetId: Types.ObjectId | string;
  notes?: string;
  rating?: number;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface IUpdateFavoriteInput {
  notes?: string;
  rating?: number;
  tags?: string[];
  customFields?: Record<string, any>;
  isActive?: boolean;
}
