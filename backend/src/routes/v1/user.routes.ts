import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as userController from '../../controllers/user.controller';
import * as userValidation from '../../validations/user.validation';
import { upload } from '../../middleware/upload';

const router = Router();

// All routes require authentication
router.use(auth());

// User profile routes
router
  .route('/me')
  .get(userController.getProfile)
  .patch(
    upload.single('avatar'),
    validate(userValidation.updateProfile),
    userController.updateProfile
  )
  .delete(userController.deleteProfile);

// User management (admin only)
router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/:userId')
  .get(validate(userValidation.getUser), userController.getUser)
  .patch(
    validate(userValidation.updateUser),
    userController.updateUser
  )
  .delete(validate(userValidation.deleteUser), userController.deleteUser);

// User favorites
router
  .route('/me/favorites')
  .get(userController.getFavorites)
  .post(validate(userValidation.toggleFavorite), userController.addFavorite)
  .delete(validate(userValidation.toggleFavorite), userController.removeFavorite);

export default router;
