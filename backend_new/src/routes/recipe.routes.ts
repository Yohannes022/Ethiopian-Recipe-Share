import { Router } from 'express';
import * as recipeController from '@/controllers/recipe.controller';
import { protect } from '@/middlewares/auth.middleware';
import {
  createRecipeValidator,
  updateRecipeValidator,
  recipeIdValidator,
  commentValidator,
  ratingValidator,
  getRecipesValidator
} from '@/validators/recipe.validator';

const router = Router();

// Public routes
router.get('/', getRecipesValidator, recipeController.getAllRecipes);
router.get('/search', recipeController.searchRecipes);
router.get('/:id', recipeIdValidator, recipeController.getRecipe);

// Protected routes (require authentication)
router.use(protect);

router.post('/', createRecipeValidator, recipeController.createRecipe);
router.patch('/:id', updateRecipeValidator, recipeController.updateRecipe);
router.delete('/:id', recipeIdValidator, recipeController.deleteRecipe);
router.post('/:id/like', recipeIdValidator, recipeController.likeRecipe);
router.post('/:id/comment', commentValidator, recipeController.addComment);
router.post('/:id/rate', ratingValidator, recipeController.rateRecipe);

export default router;
