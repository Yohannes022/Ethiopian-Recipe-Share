import { Document, Types } from 'mongoose';

export enum RecipeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export enum RecipeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface IIngredient {
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}

export interface INutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
  servingUnit?: string;
}

export interface ITiming {
  prep?: number; // in minutes
  cook: number; // in minutes
  additional?: number; // in minutes
  total: number; // in minutes
  servings: number;
}

export interface IStep {
  stepNumber: number;
  instruction: string;
  tips?: string;
  image?: string;
  timer?: number; // in seconds
}

export interface IReviewSummary {
  rating: number;
  count: number;
}

export interface IRecipe extends Document {
  title: string;
  slug: string;
  description: string;
  story?: string;
  ingredients: IIngredient[];
  instructions: IStep[];
  timing: ITiming;
  nutrition?: INutrition;
  difficulty: RecipeDifficulty;
  cuisine: string;
  categories: Types.ObjectId[];
  tags: string[];
  images: string[];
  videoUrl?: string;
  author: Types.ObjectId;
  status: RecipeStatus;
  isFeatured: boolean;
  isPrivate: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  isPopular: boolean;
  viewCount: number;
  favoritesCount: number;
  rating?: number;
  reviewsCount?: number;
  reviews?: IReviewSummary[];
  relatedRecipes: Types.ObjectId[];
  equipment: string[];
  tips: string[];
  variations?: string;
  storageInstructions?: string;
  prepAheadInstructions?: string;
  source?: {
    name: string;
    url?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface IRecipeMethods {
  // Instance methods can be defined here
}

export interface RecipeModel extends mongoose.Model<IRecipe> {
  // Static methods can be defined here
}
