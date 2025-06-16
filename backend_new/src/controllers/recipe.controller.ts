import { Request, Response, NextFunction } from 'express';
import { FilterQuery, Types } from 'mongoose';
import Recipe, { IRecipe, IRecipeModel } from '@/models/recipe.model';
import AppError from '@/utils/appError';
import { IUser } from '@/models/user.model';
import { ParsedQs } from 'qs';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
    }
  }
}

// Type for the Recipe model with static methods
const RecipeModel = Recipe as unknown as IRecipeModel;

// Helper function to filter fields
const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// @desc    Get all recipes
// @route   GET /api/v1/recipes
// @access  Public
export const getAllRecipes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Filtering
    const filter = { ...req.query } as any;
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete filter[el]);

    let queryStr = JSON.stringify(filter);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const queryFilter = JSON.parse(queryStr) as FilterQuery<IRecipe>;
    let query = Recipe.find(queryFilter).lean<IRecipe[]>();

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field limiting
    if (req.query.fields) {
      const fields = (req.query.fields as string).split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numRecipes = await Recipe.countDocuments();
      if (skip >= numRecipes) throw new Error('This page does not exist');
    }

    // EXECUTE QUERY
    const recipes = await query.populate({
      path: 'user',
      select: 'name photo'
    });

    res.status(200).json({
      status: 'success',
      results: recipes.length,
      data: {
        recipes
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single recipe
// @route   GET /api/v1/recipes/:id
// @access  Public
export const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate<{ user: IUser }>({
        path: 'user',
        select: 'name photo'
      })
      .lean()
      .exec();

    if (!recipe) {
      return next(new AppError('No recipe found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        recipe
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new recipe
// @route   POST /api/v1/recipes
// @access  Private
export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Allow nested routes
    if (!req.body.user) req.body.user = (req as any).user.id;
    
    const newRecipe = await Recipe.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        recipe: newRecipe
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update recipe
// @route   PATCH /api/v1/recipes/:id
// @access  Private
export const updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Filter out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(
      req.body,
      'title',
      'description',
      'ingredients',
      'instructions',
      'prepTime',
      'cookTime',
      'servings',
      'difficulty',
      'cuisine',
      'mealType',
      'dietaryRestrictions',
      'image',
      'isPublic'
    );

    // 2) Update recipe document
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    )
    .populate<{ user: IUser }>('user', 'name photo')
    .lean()
    .exec();

    if (!updatedRecipe) {
      return next(new AppError('No recipe found with that ID', 404));
    }

    // 3) Check if the user is the owner of the recipe
    const recipeUser = updatedRecipe.user as unknown as (IUser | Types.ObjectId);
    const recipeUserId = (recipeUser as IUser)?._id?.toString() || (recipeUser as Types.ObjectId).toString();
    if (recipeUserId !== req.user?._id?.toString()) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        recipe: updatedRecipe
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete recipe
// @route   DELETE /api/v1/recipes/:id
// @access  Private
export const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return next(new AppError('No recipe found with that ID', 404));
    }

    // Check if the user is the owner of the recipe
    const recipeUser = recipe.user as unknown as (IUser | Types.ObjectId);
    const recipeUserId = (recipeUser as IUser)?._id?.toString() || (recipeUser as Types.ObjectId).toString();
    if (recipeUserId !== req.user?._id?.toString()) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Like/Unlike a recipe
// @route   POST /api/v1/recipes/:id/like
// @access  Private
export const likeRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    const userId = (req as any).user.id;

    if (!recipe) {
      return next(new AppError('No recipe found with that ID', 404));
    }

    // Check if the user has already liked the recipe
    const isLiked = recipe.likes.includes(userId);

    if (isLiked) {
      // Unlike the recipe
      recipe.likes = recipe.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like the recipe
      recipe.likes.push(userId);
    }

    await recipe.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        recipe
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to recipe
// @route   POST /api/v1/recipes/:id/comment
// @access  Private
export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;

    if (!text) {
      return next(new AppError('Please provide comment text', 400));
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return next(new AppError('No recipe found with that ID', 404));
    }

    const newComment = {
      user: (req as any).user.id,
      text,
      createdAt: new Date()
    };

    recipe.comments.push(newComment);
    await recipe.save({ validateBeforeSave: false });

    // Populate the user details in the response
    await recipe.populate({
      path: 'comments.user',
      select: 'name photo'
    });

    const addedComment = recipe.comments[recipe.comments.length - 1];

    res.status(201).json({
      status: 'success',
      data: {
        comment: addedComment
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Rate a recipe
// @route   POST /api/v1/recipes/:id/rate
// @access  Private
export const rateRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return next(new AppError('No recipe found with that ID', 404));
    }

    // Check if user already rated this recipe
    const existingRatingIndex = recipe.ratings.findIndex(
      (r) => r.user && r.user.toString() === userId.toString()
    );

    const ratingObj = {
      user: userId,
      rating,
      comment: comment || ''
    };

    if (existingRatingIndex >= 0) {
      // Update existing rating
      recipe.ratings[existingRatingIndex] = ratingObj;
    } else {
      // Add new rating
      recipe.ratings.push(ratingObj);
    }

    // Recalculate average rating
    await recipe.save();

    res.status(200).json({
      status: 'success',
      data: {
        recipe
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search recipes with filters
// @route   GET /api/v1/recipes/search
// @access  Public
export const searchRecipes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      q, // Search query
      cuisine,
      difficulty,
      mealType,
      dietaryRestrictions,
      maxPrepTime,
      maxCookTime,
      minRating,
      sortBy = 'relevance',
      page = 1,
      limit = 10
    } = req.query;

    // Build the query
    const query: FilterQuery<IRecipe> = { isPublic: true };

    // Text search
    if (q && typeof q === 'string') {
      query.$text = { $search: q };
    }

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = typeof cuisine === 'string' ? cuisine : { $in: cuisine };
    }

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = typeof difficulty === 'string' ? difficulty : { $in: difficulty };
    }

    // Filter by meal type
    if (mealType) {
      query.mealType = typeof mealType === 'string' ? mealType : { $in: mealType };
    }


    // Filter by dietary restrictions
    if (dietaryRestrictions) {
      query.dietaryRestrictions = {
        $in: typeof dietaryRestrictions === 'string' ? [dietaryRestrictions] : dietaryRestrictions
      };
    }

    // Filter by preparation time
    if (maxPrepTime) {
      query.prepTime = { $lte: Number(maxPrepTime) };
    }

    // Filter by cooking time
    if (maxCookTime) {
      query.cookTime = { $lte: Number(maxCookTime) };
    }

    // Filter by minimum rating
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'rating':
        sort = { averageRating: -1 };
        break;
      case 'prepTime':
        sort = { prepTime: 1 };
        break;
      case 'cookTime':
        sort = { cookTime: 1 };
        break;
      default: // 'relevance' or default
        if (q) {
          sort = { score: { $meta: 'textScore' } };
        } else {
          sort = { createdAt: -1 }; // Default to newest first
        }
    }

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate({
          path: 'user',
          select: 'name photo'
        })
        .lean(),
      Recipe.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      status: 'success',
      results: recipes.length,
      total,
      totalPages,
      currentPage: Number(page),
      data: {
        recipes
      }
    });
  } catch (err) {
    next(err);
  }
};


