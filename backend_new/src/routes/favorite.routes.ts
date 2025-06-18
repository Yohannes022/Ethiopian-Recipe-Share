import { Router } from 'express';
import { protect } from '@/middlewares/auth.middleware';
import { addToFavorites, removeFromFavorites, getUserFavorites } from '@/controllers/favorite.controller';

const router = Router();

// Protected routes
router.use(protect);

router.route('/')
  .post(addToFavorites)
  .get(getUserFavorites);

router.route('/:id')
  .delete(removeFromFavorites);

export default router;
