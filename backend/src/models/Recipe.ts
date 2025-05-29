import mongoose, { Document, Schema, Types, Query } from 'mongoose';

export interface IIngredient {
  name: string;
  quantity: string;
  unit?: string;
  notes?: string;
}

export interface IInstruction {
  step: number;
  description: string;
  image?: string;
}

export interface IReview {
  user: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IRecipe extends Document {
  title: string;
  description: string;
  ingredients: IIngredient[];
  instructions: IInstruction[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  mealType: string[];
  dietaryInfo: string[];
  images: string[];
  tags: string[];
  author: Types.ObjectId;
  isPublished: boolean;
  averageRating?: number;
  reviews?: IReview[];
  viewCount: number;
  favorites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true, trim: true },
  quantity: { type: String, required: true },
  unit: { type: String },
  notes: { type: String },
});

const InstructionSchema = new Schema<IInstruction>({
  step: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String },
});

const ReviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const RecipeSchema = new Schema<IRecipe>(
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
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    ingredients: {
      type: [IngredientSchema],
      required: [true, 'Please provide at least one ingredient'],
      validate: {
        validator: (v: IIngredient[]) => v.length > 0,
        message: 'Please provide at least one ingredient',
      },
    },
    instructions: {
      type: [InstructionSchema],
      required: [true, 'Please provide at least one instruction'],
      validate: {
        validator: (v: IInstruction[]) => v.length > 0,
        message: 'Please provide at least one instruction',
      },
    },
    prepTime: {
      type: Number,
      required: [true, 'Please provide preparation time in minutes'],
      min: [0, 'Preparation time cannot be negative'],
    },
    cookTime: {
      type: Number,
      required: [true, 'Please provide cooking time in minutes'],
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
    mealType: {
      type: [String],
      required: [true, 'Please provide at least one meal type'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'Please provide at least one meal type',
      },
    },
    dietaryInfo: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an author'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    reviews: {
      type: [ReviewSchema],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
RecipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
RecipeSchema.index({ author: 1 });
RecipeSchema.index({ averageRating: -1 });
RecipeSchema.index({ createdAt: -1 });

// Calculate average rating
RecipeSchema.methods.calculateAverageRating = async function (this: IRecipe) {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    this.averageRating = total / this.reviews.length;
  } else {
    this.averageRating = undefined;
  }
  await this.save();
  return this.averageRating;
};

// Virtual for total time
RecipeSchema.virtual('totalTime').get(function (this: IRecipe) {
  return this.prepTime + this.cookTime;
});

// Populate author on find
RecipeSchema.pre<Query<any, IRecipe>>(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: 'name email photo',
  });
  next();
});

const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;
