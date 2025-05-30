import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import { Recipe } from '@/models/Recipe';
import { BadRequestError, NotFoundError } from '@/utils/apiError';
import { IRecipe, IRecipeVirtuals } from '@/types/recipe.types';
import { protect, restrictTo } from '../middleware/auth';
import Restaurant from '@/models/Restaurant';

// Get all recipes with filters
export const getAllRecipes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract query parameters
    const {
      title,
      cuisine,
      category,
      difficulty,
      minRating,
      maxRating,
      minPrepTime,
      maxPrepTime,
      minCookTime,
      maxCookTime,
      minServings,
      maxServings,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query: any = {};

    if (title) query.title = { $regex: title, $options: 'i' };
    if (cuisine) query.cuisine = { $regex: cuisine, $options: 'i' };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (maxRating) query.rating = { $lte: Number(maxRating) };
    if (minPrepTime) query.preparationTime = { $gte: Number(minPrepTime) };
    if (maxPrepTime) query.preparationTime = { $lte: Number(maxPrepTime) };
    if (minCookTime) query.cookingTime = { $gte: Number(minCookTime) };
    if (maxCookTime) query.cookingTime = { $lte: Number(maxCookTime) };
    if (minServings) query.servings = { $gte: Number(minServings) };
    if (maxServings) query.servings = { $lte: Number(maxServings) };

    // Build sort
    const sortOptions: any = {};
    if (sort === 'newest') sortOptions.createdAt = -1;
    else if (sort === 'oldest') sortOptions.createdAt = 1;
    else if (sort === 'rating') sortOptions.rating = -1;
    else if (sort === 'views') sortOptions.views = -1;
    else sortOptions.createdAt = -1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count
    const total = await Recipe.countDocuments(query);

    // Get recipes
    const recipes = await Recipe.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name photo')
      .populate('category', 'name');

    res.status(200).json({
      status: 'success',
      results: recipes.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: recipes,
    });
  } catch (error) {
    next(error);
  }
};

// Create new recipe
export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// Get recipe by ID
export const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('user', 'name photo')
      .populate('category', 'name')
      .populate('reviews', 'rating comment user')
      .populate('likes', 'name photo');

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    // Update views
    recipe.updateViews();
    await recipe.save();

    res.status(200).json({
      status: 'success',
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// Update recipe
export const updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First get the recipe to check ownership
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    // Check if user is owner or admin
    const recipeObj = recipe.toObject();
    if ((!recipeObj.author || recipeObj.author.toString() !== req.user._id) && req.user.role !== 'admin') {
      throw new BadRequestError('You do not have permission to update this recipe');
    }

    // Update recipe and populate virtuals in one query
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name photo')
     .populate('category', 'name');

    res.status(200).json({
      status: 'success',
      data: updatedRecipe
    });
  } catch (error) {
    next(error);
  }
};

// Delete recipe
export const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    // Check if user is owner or admin
    const recipeObj = recipe.toObject();
    if ((!recipeObj.author || recipeObj.author.toString() !== req.user._id) && req.user.role !== 'admin') {
      throw new BadRequestError('You do not have permission to delete this recipe');
    }

    // Delete recipe
    await recipe.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// // Get recipes by user
// export const getRecipesByUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const recipes = await Recipe.find({ user: req.params.userId })
//       .sort({ createdAt: -1 })
//       .populate('user', 'name photo')
//       .populate('category', 'name');

//     res.status(200).json({
//       status: 'success',
//       results: recipes.length,
//       data: recipes,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Like recipe
// export const likeRecipe = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const recipe = await Recipe.findById(req.params.id);

//     if (!recipe) {
//       throw new NotFoundError('Recipe not found');
//     }
//     if (!recipe.user.equals(req.user._id) && req.user.role !== 'admin') {
//       throw new BadRequestError('You do not have permission to delete this recipe');
//     }

//     // Delete the recipe
//     await Recipe.findByIdAndDelete(req.params.id);

//     res.status(204).json({
//       status: 'success',
//       data: null
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// Get recipes by user
export const getRecipesByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipes = await Recipe.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name photo')
      .populate('category', 'name');

    res.status(200).json({
      status: 'success',
      results: recipes.length,
      data: recipes,
    });
  } catch (error) {
    next(error);
  }
};

// Like recipe
export const likeRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return next(new NotFoundError('No recipe found with that ID'));
    }

    // Get user ID from authenticated request
    const userId = new mongoose.Types.ObjectId((req as any).user.id);
    const hasLiked = recipe.likes.some(id => id.toString() === userId.toString());

    if (hasLiked) {
      await recipe.removeLike(userId);
    } else {
      await recipe.addLike(userId);
    }

    // Populate likes with user details
    await recipe.populate({
      path: 'likes',
      select: 'name photo',
    });

    res.status(200).json({
      status: 'success',
      data: {
        likes: recipe.likes,
        likesCount: recipe.likes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Comment on recipe
export const commentOnRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    if (!content) {
      return next(new BadRequestError('Please provide comment content'));
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return next(new NotFoundError('No recipe found with that ID'));
    }

    // Get user ID from authenticated request
    const userId = new mongoose.Types.ObjectId((req as any).user.id);
    await recipe.addComment({ user: userId, text: content });

    res.status(201).json({
      status: 'success',
      data: {
        comments: recipe.comments,
      },
    });
  } catch (error) {
    next(error);
  }
};
