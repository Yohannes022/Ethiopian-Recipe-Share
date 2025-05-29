import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  slug: string;
  image?: string;
  icon?: string;
  parent?: Types.ObjectId | ICategory;
  ancestors: Array<{
    _id: Types.ObjectId;
    name: string;
    slug: string;
  }>;
  children: Types.ObjectId[] | ICategory[];
  level: number;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  metadata?: Record<string, any>;
  createdBy: Types.ObjectId | string;
  updatedBy: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryTree extends ICategory {
  children: ICategoryTree[];
}

export interface ICategoryFilters {
  parent?: Types.ObjectId | string | null;
  level?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  searchTerm?: string;
  slug?: string;
  ids?: string[] | Types.ObjectId[];
  excludeIds?: string[] | Types.ObjectId[];
  sortBy?: 'name' | 'order' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface ICategoryStats {
  totalCategories: number;
  activeCategories: number;
  featuredCategories: number;
  categoriesByLevel: Record<number, number>;
  recentCategories: ICategory[];
  topLevelCategories: ICategory[];
}
