import { Router } from 'express';
import v1Routes from './v1';
import healthCheckRoutes from './healthCheck';

const router = Router();

// Health check route (public)
router.use(healthCheckRoutes);

// API v1 routes
router.use('/api/v1', v1Routes);

export default router;
