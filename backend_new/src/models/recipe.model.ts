import mongoose, { Document, Schema, Types, Model } from 'mongoose';
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
  prepTime: number; // in minutes
  cookTime: number; // in minutes
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

const ingredientSchema = new Schema<IIngredient>({
  name: { type: String, required: [true, 'An ingredient must have a name'] },
  quantity: { type: Number, required: [true, 'Please provide quantity'] },
  unit: { type: String, required: [true, 'Please provide unit'] },
  notes: String
});

const instructionSchema = new Schema<IInstruction>({
  step: { type: Number, required: true },
  description: { type: String, required: [true, 'Please provide instruction description'] },
  duration: Number // in minutes
});

const recipeSchema = new Schema<IRecipe>(
  {
    title: {
      type: String,
      required: [true, 'A recipe must have a title'],
      trim: true,
      maxlength: [100, 'A recipe title must have less or equal than 100 characters'],
      minlength: [5, 'A recipe title must have more or equal than 5 characters']
    },
    description: {
      type: String,
      required: [true, 'A recipe must have a description'],
      trim: true
    },
    ingredients: [ingredientSchema],
    instructions: [instructionSchema],
    prepTime: {
      type: Number,
      required: [true, 'Please provide preparation time']
    },
    cookTime: {
      type: Number,
      required: [true, 'Please provide cooking time']
    },
    servings: {
      type: Number,
      required: [true, 'Please provide number of servings']
    },
    difficulty: {
      type: String,
      required: [true, 'Please provide difficulty level'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty is either: easy, medium, or hard'
      }
    },
    cuisine: {
      type: String,
      required: [true, 'Please provide cuisine type']
    },
    mealType: {
      type: [String],
      required: [true, 'Please provide at least one meal type']
    },
    dietaryRestrictions: [String],
    image: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A recipe must belong to a user']
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        text: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    averageRating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratings: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        }
      }
    ],
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
recipeSchema.index({ title: 'text', description: 'text' });
recipeSchema.index({ user: 1 });
recipeSchema.index({ averageRating: -1 });

// Virtual field for total time (prep + cook time)
recipeSchema.virtual('totalTime').get(function (this: IRecipe) {
  return this.prepTime + this.cookTime;
});

// Virtual populate for reviews
recipeSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'recipe',
  localField: '_id'
});

// Update average rating after saving or updating ratings
recipeSchema.pre(/^findOneAnd/, async function (next) {
  // @ts-ignore
  this.r = await this.findOne();
  next();
});

recipeSchema.post(/^findOneAnd/, async function () {
  // @ts-ignore
  await this.r.constructor.calcAverageRatings(this.r._id);
});

// Static method to calculate average ratings
recipeSchema.statics.calcAverageRatings = async function (recipeId: string) {
  const stats = await this.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(recipeId) }
    },
    {
      $unwind: '$ratings'
    },
    {
      $group: {
        _id: '$_id',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$ratings.rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(recipeId, {
      averageRating: Math.ceil(stats[0].avgRating * 10) / 10
    });
  } else {
    await this.findByIdAndUpdate(recipeId, {
      averageRating: undefined
    });
  }
};

// Update average rating after saving a rating
recipeSchema.post('save', function () {
  // @ts-ignore
  this.constructor.calcAverageRatings(this._id);
});

// Create indexes for efficient querying
recipeSchema.index({ title: 1 });
recipeSchema.index({ description: 1 });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ mealType: 1 });
recipeSchema.index({ createdAt: -1 });
// Add text index for search
recipeSchema.index({
  title: 'text',
  description: 'text',
  cuisine: 'text',
  mealType: 'text',
  dietaryRestrictions: 'text'
});

const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema);

export default Recipe;
