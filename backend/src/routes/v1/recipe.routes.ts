import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { recipeController } from '../../controllers/recipe.controller';
import * as recipeValidation from '../../validations/recipe.validation';
import { upload } from '../../middleware/upload';
import { apiLimiter } from '../../middleware/rate-limit';
import { UserRole } from '@/interfaces/user.interface';

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/', validate(recipeValidation.getRecipes), recipeController.getRecipes);
router.get('/search', recipeController.searchRecipes);
router.get('/:id', validate(recipeValidation.getRecipe), recipeController.getRecipe);
router.get('/user/:userId', validate(recipeValidation.getUserRecipes), recipeController.getUserRecipes);

// Protected routes (require authentication)
router.use(auth());

// Admin routes
// router.use(auth(UserRole.ADMIN)); // Uncomment and use when admin routes are needed

// Recipe CRUD operations
router.post(
  '/',
  upload.array('images', 5),
  validate(recipeValidation.createRecipe),
  recipeController.createRecipe
);

router
  .route('/:id')
  .patch(
    upload.array('images', 5),
    validate(recipeValidation.updateRecipe),
    recipeController.updateRecipe
  )
  .delete(validate(recipeValidation.deleteRecipe), recipeController.deleteRecipe);

// Recipe interactions
router.post(
  '/:id/like',
  validate(recipeValidation.likeRecipe),
  recipeController.likeRecipe
);

router.post(
  '/:id/comment',
  validate(recipeValidation.commentOnRecipe),
  recipeController.addComment
);

// Export the router
export { router as recipeRoutes };

export default router;
