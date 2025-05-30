import mongoose, { Schema, Document, Model } from 'mongoose';
import { IRecipe, IRecipeMethods, RecipeModel } from '@/types/recipe.types';

const recipeSchema = new mongoose.Schema<IRecipe, RecipeModel, IRecipeMethods>(
  {
    title: {
      type: String,
      required: [true, 'Recipe must have a title'],
      trim: true,
      maxlength: [100, 'Recipe title must be less than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Recipe must have a description'],
      trim: true,
    },
    preparationTime: {
      type: Number,
      required: [true, 'Recipe must have preparation time'],
      min: [1, 'Preparation time must be at least 1 minute'],
    },
    cookingTime: {
      type: Number,
      required: [true, 'Recipe must have cooking time'],
      min: [1, 'Cooking time must be at least 1 minute'],
    },
    servings: {
      type: Number,
      required: [true, 'Recipe must have number of servings'],
      min: [1, 'Number of servings must be at least 1'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Recipe must have a difficulty level'],
    },
    cuisine: {
      type: String,
      required: [true, 'Recipe must have a cuisine type'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Recipe must belong to a category'],
    },
    ingredients: [{
      name: {
        type: String,
        required: [true, 'Ingredient must have a name'],
        trim: true,
      },
      quantity: {
        type: String,
        required: [true, 'Ingredient must have a quantity'],
        trim: true,
      },
      unit: {
        type: String,
        required: [true, 'Ingredient must have a unit'],
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
      },
    }],
    instructions: [{
      step: {
        type: Number,
        required: [true, 'Instruction must have a step number'],
      },
      description: {
        type: String,
        required: [true, 'Instruction must have a description'],
        trim: true,
      },
      time: {
        type: String,
        trim: true,
      },
      image: {
        type: String,
        trim: true,
      },
    }],
    nutrition: {
      calories: {
        type: Number,
        required: [true, 'Recipe must have calorie information'],
        min: [0, 'Calories cannot be negative'],
      },
      protein: {
        type: Number,
        required: [true, 'Recipe must have protein information'],
        min: [0, 'Protein cannot be negative'],
      },
      fat: {
        type: Number,
        required: [true, 'Recipe must have fat information'],
        min: [0, 'Fat cannot be negative'],
      },
      carbohydrates: {
        type: Number,
        required: [true, 'Recipe must have carbohydrate information'],
        min: [0, 'Carbohydrates cannot be negative'],
      },
      fiber: {
        type: Number,
        required: [true, 'Recipe must have fiber information'],
        min: [0, 'Fiber cannot be negative'],
      },
      sugar: {
        type: Number,
        required: [true, 'Recipe must have sugar information'],
        min: [0, 'Sugar cannot be negative'],
      },
    },
    image: {
      type: String,
      required: [true, 'Recipe must have an image'],
      trim: true,
    },
    video: {
      type: String,
      trim: true,
    },
    tags: [{
      name: {
        type: String,
        required: [true, 'Tag must have a name'],
        trim: true,
      },
      type: {
        type: String,
        enum: ['cuisine', 'diet', 'occasion', 'difficulty'],
        required: [true, 'Tag must have a type'],
      },
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipe must belong to a user'],
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: [true, 'Comment must have content'],
        trim: true,
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    views: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be more than 5'],
    },
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    }],
    featured: {
      type: Boolean,
      default: false,
    },
    private: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
recipeSchema.index({ title: 'text', description: 'text', cuisine: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ user: 1 });
recipeSchema.index({ rating: -1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ featured: 1 });

// Virtual populate
recipeSchema.virtual('user', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  select: 'name photo',
});

recipeSchema.virtual('category', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true,
  select: 'name',
});

// Instance methods
recipeSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    return;
  }

  const totalRating = this.reviews.reduce((sum, reviewId) => {
    return sum + (reviewId.rating || 0);
  }, 0);

  this.rating = totalRating / this.reviews.length;
};

recipeSchema.methods.updateViews = function () {
  this.views += 1;
};

recipeSchema.methods.addLike = function (userId: mongoose.Types.ObjectId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
  }
};

recipeSchema.methods.removeLike = function (userId: mongoose.Types.ObjectId) {
  this.likes = this.likes.filter((like) => !like.equals(userId));
};

recipeSchema.methods.addComment = function (
  userId: mongoose.Types.ObjectId,
  content: string
) {
  const comment = {
    user: userId,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  this.comments.push(comment);
};

recipeSchema.methods.removeComment = function (commentId: mongoose.Types.ObjectId) {
  this.comments = this.comments.filter((comment) => !comment._id.equals(commentId));
};

// Pre-save middleware to calculate rating before saving
recipeSchema.pre('save', function (next) {
  this.calculateRating();
  next();
});

// Create and export the model
const Recipe = mongoose.model<IRecipe, RecipeModel>('Recipe', recipeSchema);
export default Recipe;
