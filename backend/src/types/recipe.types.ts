import { Document, Model, Types } from 'mongoose';

export interface IIngredient {
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
}

export interface IInstruction {
  step: number;
  description: string;
  time?: string;
  image?: string;
}

export interface INutrition {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  sugar: number;
}

export interface IComment {
  user: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: Types.ObjectId[];
}

export interface ITag {
  name: string;
  type: 'cuisine' | 'diet' | 'occasion' | 'difficulty';
}

export interface IRecipe extends Document {
  title: string;
  description: string;
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  category: Types.ObjectId;
  ingredients: IIngredient[];
  instructions: IInstruction[];
  nutrition: INutrition;
  image: string;
  video?: string;
  tags: ITag[];
  user: Types.ObjectId;
  likes: Types.ObjectId[];
  comments: IComment[];
  views: number;
  rating: number;
  reviews: Types.ObjectId[];
  featured: boolean;
  private: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Virtual properties
export interface IRecipeVirtuals {
  user?: {
    name: string;
    photo: string;
  };
  category?: {
    name: string;
  };
}

export interface IRecipeMethods {
  calculateRating(): void;
  updateViews(): void;
  addLike(userId: Types.ObjectId): void;
  removeLike(userId: Types.ObjectId): void;
  addComment(userId: Types.ObjectId, content: string): void;
  removeComment(commentId: Types.ObjectId): void;
}

export type RecipeModel = Model<IRecipe, {}, IRecipeMethods>;
