import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import recipeRoutes from './recipes';
import restaurantRoutes from './restaurants';
import menuItemRoutes from './menu-items';
import orderRoutes from './orders';
import reviewRoutes from './reviews';
import categoryRoutes from './categories';
import searchRoutes from './search';
import uploadRoutes from './upload';
import favoriteRoutes from './favorites';
import notificationRoutes from './notifications';
import healthCheckRoutes from './healthCheck';

const router = Router();

// API versioning
const apiVersion = '/api/v1';

// Health check route (public)
router.use(healthCheckRoutes);

// API routes with versioning
router.use(`${apiVersion}/auth`, authRoutes);
router.use(`${apiVersion}/users`, userRoutes);
router.use(`${apiVersion}/recipes`, recipeRoutes);
router.use(`${apiVersion}/restaurants`, restaurantRoutes);
router.use(`${apiVersion}/menu-items`, menuItemRoutes);
router.use(`${apiVersion}/orders`, orderRoutes);
router.use(`${apiVersion}/reviews`, reviewRoutes);
router.use(`${apiVersion}/categories`, categoryRoutes);
router.use(`${apiVersion}/search`, searchRoutes);
router.use(`${apiVersion}/upload`, uploadRoutes);
router.use(`${apiVersion}/favorites`, favoriteRoutes);
router.use(`${apiVersion}/notifications`, notificationRoutes);

// Analytics routes (admin only)
const analyticsRoutes = Router();
import analyticsRoutesImport from './analytics';
analyticsRoutes.use(`${apiVersion}/analytics`, analyticsRoutesImport);
router.use(analyticsRoutes);

export default router;
