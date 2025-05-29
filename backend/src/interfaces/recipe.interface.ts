import { Document, Types } from 'mongoose';
import { IngredientDto, StepDto } from '../dto/recipe.dto';

export interface IIngredient extends IngredientDto {
  _id?: Types.ObjectId;
}

export interface IStep extends StepDto {
  _id?: Types.ObjectId;
  image?: string;
}

export interface IRecipe extends Document {
  title: string;
  description: string;
  ingredients: IIngredient[];
  steps: IStep[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: Types.ObjectId;
  tags?: string[];
  images?: string[];
  isPublic: boolean;
  createdBy: Types.ObjectId;
  likes: Types.ObjectId[];
  averageRating?: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecipeService {
  createRecipe(createRecipeDto: any, userId: string): Promise<IRecipe>;
  getRecipeById(id: string): Promise<IRecipe>;
  updateRecipe(id: string, updateRecipeDto: any, userId: string): Promise<IRecipe>;
  deleteRecipe(id: string, userId: string): Promise<void>;
  getRecipes(query: any): Promise<{ data: IRecipe[]; total: number }>;
  likeRecipe(recipeId: string, userId: string): Promise<{ isLiked: boolean }>;
  addComment(recipeId: string, userId: string, text: string): Promise<IRecipe>;
  getUserRecipes(userId: string, isCurrentUser: boolean): Promise<IRecipe[]>;
  searchRecipes(query: string, filters: any): Promise<IRecipe[]>;
}
