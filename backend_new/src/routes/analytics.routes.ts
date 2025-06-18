import express from 'express';
import { getUserAnalytics, getOrderAnalytics, getRestaurantAnalytics } from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// Analytics endpoints (admin only)
router.use(protect, restrictTo('admin'));

router.get('/users', getUserAnalytics);
router.get('/orders', getOrderAnalytics);
router.get('/restaurants', getRestaurantAnalytics);

export default router;
