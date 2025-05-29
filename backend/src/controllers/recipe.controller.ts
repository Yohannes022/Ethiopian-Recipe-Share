import { Request, Response, NextFunction } from 'express';
import { recipeService } from '../services/recipe.service';
import { CreateRecipeDto, RecipeQueryDto, UpdateRecipeDto } from '../dto/recipe.dto';
import { IUser } from '@/interfaces/user.interface';
import ApiResponse from '../utils/api-response';
import { StatusCodes } from 'http-status-codes';

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export class RecipeController {
  /**
   * Create a new recipe
   */
  createRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', StatusCodes.UNAUTHORIZED);
      }
      const recipe = await recipeService.createRecipe(req.body, userId);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: { recipe },
        message: 'Recipe created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single recipe by ID
   */
  getRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recipe = await recipeService.getRecipeById(req.params.id);
      res.status(StatusCodes.OK).json({
        success: true,
        data: { recipe }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a recipe
   */
  updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', StatusCodes.UNAUTHORIZED);
      }
      const recipe = await recipeService.updateRecipe(
        req.params.id,
        req.body,
        userId
      );
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: { recipe },
        message: 'Recipe updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a recipe
   */
  deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', StatusCodes.UNAUTHORIZED);
      }
      await recipeService.deleteRecipe(req.params.id, userId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: { success: true },
        message: 'Recipe deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all recipes with filtering and pagination
   */
  getRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data: recipes, total } = await recipeService.getRecipes(
        req.query as unknown as RecipeQueryDto
      );
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const totalPages = Math.ceil(total / limit);

      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          recipes,
          pagination: {
            total,
            page,
            limit,
            totalPages,
          },
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Like or unlike a recipe
   */
  likeRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', StatusCodes.UNAUTHORIZED);
      }
      const result = await recipeService.likeRecipe(req.params.id, userId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add a comment to a recipe
   */
  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', StatusCodes.UNAUTHORIZED);
      }
      
      const { text } = req.body;
      if (!text) {
        return ApiResponse.error(res, 'Comment text is required', StatusCodes.BAD_REQUEST);
      }
      
      const recipe = await recipeService.addComment(req.params.id, userId, text);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: { recipe },
        message: 'Comment added successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get recipes by user
   */
  getUserRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?._id?.toString();
      if (!currentUserId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
      }
      const isCurrentUser = req.params.userId === currentUserId;
      const recipes = await recipeService.getUserRecipes(
        req.params.userId,
        isCurrentUser
      );
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: { recipes }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search recipes
   */
  searchRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, ...filters } = req.query;
      
      if (!q) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: { message: 'Search query is required' }
        });
      }
      
      const recipes = await recipeService.searchRecipes(
        q as string,
        filters as any
      );
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: { recipes }
      });
    } catch (error) {
      next(error);
    }
  };
}

export const recipeController = new RecipeController();
