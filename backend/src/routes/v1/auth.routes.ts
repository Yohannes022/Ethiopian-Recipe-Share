import { Router } from 'express';
import { validate } from '../../middleware/validate';
import * as authController from '../../controllers/auth.controller';
import * as authValidation from '../../validations/auth.validation';

const router = Router();

// Auth routes
router.post(
  '/register',
  validate(authValidation.register),
  authController.register
);

router.post(
  '/login',
  validate(authValidation.login),
  authController.login
);

router.post(
  '/refresh-token',
  validate(authValidation.refreshToken),
  authController.refreshTokens
);

router.post(
  '/forgot-password',
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate(authValidation.resetPassword),
  authController.resetPassword
);

router.post('/logout', authController.logout);

export default router;
