import { Schema, model, Document, Model, Types } from 'mongoose';
import { IUser, IUserMethods, UserModel } from '@/types/user.types';

export interface IRecipeMethods {
  updateViews(): Promise<void>;
  addLike(userId: Types.ObjectId): Promise<IRecipe>;
  removeLike(userId: Types.ObjectId): Promise<IRecipe>;
  addComment(comment: { user: Types.ObjectId | IUser; text: string }): Promise<IRecipe>;
}

export interface IRecipe extends Document, IRecipeMethods {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  categories: string[];
  image?: string;
  video?: string;
  author: Types.ObjectId | IUser;
  likes: Types.ObjectId[];
  comments: Array<{
    user: Types.ObjectId | IUser;
    text: string;
    createdAt: Date;
  }>;
  views: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type RecipeModel = Model<IRecipe, {}, IRecipeMethods>;

const RecipeSchema = new Schema<IRecipe, RecipeModel, IRecipeMethods>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a recipe title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a recipe description'],
      trim: true,
    },
    ingredients: {
      type: [String],
      required: [true, 'Please provide recipe ingredients'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'Please provide at least one ingredient',
      },
    },
    instructions: {
      type: [String],
      required: [true, 'Please provide recipe instructions'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'Please provide at least one instruction',
      },
    },
    prepTime: {
      type: Number,
      required: [true, 'Please provide preparation time'],
      min: [0, 'Preparation time cannot be negative'],
    },
    cookTime: {
      type: Number,
      required: [true, 'Please provide cooking time'],
      min: [0, 'Cooking time cannot be negative'],
    },
    servings: {
      type: Number,
      required: [true, 'Please provide number of servings'],
      min: [1, 'Servings must be at least 1'],
    },
    difficulty: {
      type: String,
      required: [true, 'Please provide difficulty level'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be easy, medium, or hard',
      },
    },
    cuisine: {
      type: String,
      required: [true, 'Please provide cuisine type'],
      trim: true,
    },
    categories: {
      type: [String],
      required: [true, 'Please provide at least one category'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'Please provide at least one category',
      },
    },
    image: {
      type: String,
      default: 'default.jpg',
    },
    video: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an author'],
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: [true, 'Please provide comment text'],
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
RecipeSchema.index({ title: 'text', description: 'text', ingredients: 'text' });

// Add methods to the schema
RecipeSchema.methods.updateViews = async function (): Promise<void> {
  this.views += 1;
  await this.save();
};

RecipeSchema.methods.addLike = async function (userId: Types.ObjectId): Promise<IRecipe> {
  const userIdStr = userId.toString();
  const hasLiked = this.likes.some((id: Types.ObjectId) => id.toString() === userIdStr);
  
  if (!hasLiked) {
    this.likes.push(userId);
    await this.save();
  }
  return this;
};

RecipeSchema.methods.removeLike = async function (userId: Types.ObjectId): Promise<IRecipe> {
  const userIdStr = userId.toString();
  this.likes = this.likes.filter((id: Types.ObjectId) => id.toString() !== userIdStr);
  await this.save();
  return this;
};

RecipeSchema.methods.addComment = async function (comment: { 
  user: Types.ObjectId | IUser; 
  text: string 
}): Promise<IRecipe> {
  this.comments.push({
    user: comment.user,
    text: comment.text,
    createdAt: new Date()
  });
  await this.save();
  return this;
};

// Create and export the model
const Recipe = model<IRecipe, RecipeModel>('Recipe', RecipeSchema);

export { Recipe };