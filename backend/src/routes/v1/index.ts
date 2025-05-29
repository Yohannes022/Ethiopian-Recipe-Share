import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import recipeRoutes from './recipe.routes';
import restaurantRoutes from './restaurant.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/recipes', recipeRoutes);
router.use('/restaurants', restaurantRoutes);

export default router;
