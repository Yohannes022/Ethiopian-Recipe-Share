import { Router } from 'express';
import * as profileController from '@/controllers/profile.controller';
import { protect } from '@/middlewares/auth.middleware';
import { updateProfileValidator } from '@/validators/profile.validator';
import { upload, handleMulterErrors } from '@/middlewares/upload.middleware';
import { param } from 'express-validator';
import { validate } from '@/middlewares/validate-request.middleware';

const router = Router();

// All routes below are protected
router.use(protect);

// Get current user's profile
router.get('/me', profileController.getMyProfile);

// Update current user's profile
router.patch('/me', updateProfileValidator, profileController.updateProfile);

// Profile picture routes
router.post(
  '/me/picture',
  protect,
  upload.single('profilePicture'),
  handleMulterErrors,
  profileController.uploadProfilePicture
);

router.get(
  '/:userId/picture',
  [
    param('userId').isMongoId().withMessage('Invalid user ID format'),
    validate
  ],
  profileController.getProfilePicture
);

router.delete(
  '/me/picture',
  protect,
  profileController.deleteProfilePicture
);

// Get all profiles (admin only)
router.get('/', profileController.getAllProfiles);

// Get user profile by ID
router.get(
  '/:userId',
  [
    param('userId').isMongoId().withMessage('Invalid user ID format'),
    validate
  ],
  profileController.getUserProfile
);

export default router;
