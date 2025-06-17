import mongoose, { Document, Types, Model } from 'mongoose';
import { IUser } from './user.model';
export interface IIngredient {
    name: string;
    quantity: number;
    unit: string;
    notes?: string;
}
export interface IInstruction {
    step: number;
    description: string;
    duration?: number;
}
export interface IRating {
    user: Types.ObjectId | IUser;
    rating: number;
}
export interface IComment {
    user: Types.ObjectId | IUser;
    text: string;
    createdAt: Date;
}
export interface IRecipe extends Document {
    title: string;
    description: string;
    ingredients: IIngredient[];
    instructions: IInstruction[];
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    cuisine: string;
    mealType: string[];
    dietaryRestrictions: string[];
    image?: string;
    user: Types.ObjectId | IUser;
    likes: (Types.ObjectId | IUser)[];
    comments: IComment[];
    averageRating?: number;
    ratings: IRating[];
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IRecipeModel extends Model<IRecipe> {
    calcAverageRatings(recipeId: string): Promise<void>;
}
declare const Recipe: mongoose.Model<IRecipe, {}, {}, {}, mongoose.Document<unknown, {}, IRecipe, {}> & IRecipe & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Recipe;
