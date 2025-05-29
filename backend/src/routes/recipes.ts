import { Router } from 'express';
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByUser,
  likeRecipe,
  addComment,
} from '../controllers/recipe.controller';
import { auth, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRecipeSchema, updateRecipeSchema, commentSchema } from '../validations/recipe.validation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       required:
 *         - title
 *         - ingredients
 *         - instructions
 *         - prepTime
 *         - cookTime
 *         - servings
 *         - difficulty
 *         - cuisine
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the recipe
 *         title:
 *           type: string
 *           description: The recipe title
 *         description:
 *           type: string
 *           description: A short description of the recipe
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           description: List of ingredients
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *           description: Step-by-step cooking instructions
 *         prepTime:
 *           type: number
 *           description: Preparation time in minutes
 *         cookTime:
 *           type: number
 *           description: Cooking time in minutes
 *         servings:
 *           type: number
 *           description: Number of servings
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Difficulty level
 *         cuisine:
 *           type: string
 *           description: Type of cuisine (e.g., Ethiopian, Italian)
 *         isVegetarian:
 *           type: boolean
 *           default: false
 *           description: Whether the recipe is vegetarian
 *         isVegan:
 *           type: boolean
 *           default: false
 *           description: Whether the recipe is vegan
 *         isGlutenFree:
 *           type: boolean
 *           default: false
 *           description: Whether the recipe is gluten-free
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the recipe
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         user:
 *           type: string
 *           description: ID of the user who created the recipe
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the recipe was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the recipe was last updated
 *     Comment:
 *       type: object
 *       required:
 *         - user
 *         - text
 *       properties:
 *         user:
 *           type: string
 *           description: ID of the user who made the comment
 *         text:
 *           type: string
 *           description: The comment text
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the comment was created
 */

/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: Recipe management and retrieval
 */

// Public routes
router.get('/', getRecipes);
router.get('/:id', getRecipe);
router.get('/user/:userId', getRecipesByUser);

// Protected routes
router.use(auth);

router.post('/', validate(createRecipeSchema), createRecipe);
router.put('/:id', validate(updateRecipeSchema), updateRecipe);
router.delete('/:id', deleteRecipe);
router.post('/:id/like', likeRecipe);
router.post('/:id/comment', validate(commentSchema), addComment);

export default router;
