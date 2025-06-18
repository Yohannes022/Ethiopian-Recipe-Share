import express from 'express';
import { createCategory, getCategories, getCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { protect, restrictTo } from '@/middlewares/auth.middleware';
import { isAdmin } from '@/middlewares/admin.middleware';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.post('/', [protect, restrictTo('admin'), isAdmin], createCategory);
router.put('/:id', [protect, restrictTo('admin'), isAdmin], updateCategory);
router.delete('/:id', [protect, restrictTo('admin'), isAdmin], deleteCategory);

export default router;
