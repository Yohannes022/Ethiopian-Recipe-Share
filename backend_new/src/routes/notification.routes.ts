import { Router } from 'express';
import { protect } from '@/middlewares/auth.middleware';
import { getNotifications, markNotificationAsRead } from '@/controllers/notification.controller';

const router = Router();

// Protected routes
router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/:id/read')
  .put(markNotificationAsRead);

export default router;
