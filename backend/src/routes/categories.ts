import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { auth, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the category
 *         name:
 *           type: string
 *           description: The name of the category
 *         description:
 *           type: string
 *           description: A short description of the category
 *         type:
 *           type: string
 *           enum: [cuisine, dietary, meal, course, other]
 *           description: The type of category
 *         icon:
 *           type: string
 *           description: URL to an icon for the category
 *         image:
 *           type: string
 *           description: URL to an image representing the category
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the category is active
 *         parent:
 *           type: string
 *           description: ID of the parent category (for subcategories)
 *         order:
 *           type: number
 *           default: 0
 *           description: Display order of the category
 *         slug:
 *           type: string
 *           description: URL-friendly version of the name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the category was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the category was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management and retrieval
 */

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes - require authentication and admin role
router.use(auth);
router.use(authorize(['admin']));

router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
