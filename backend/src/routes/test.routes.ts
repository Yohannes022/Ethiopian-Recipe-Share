import { Router } from 'express';
import { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError } from '@/utils/apiError';

const router = Router();

// Test route for 404 error
router.get('/not-found', (req, res, next) => {
  next(new NotFoundError('Test 404 - Resource not found'));
});

// Test route for 400 error
router.get('/bad-request', (req, res, next) => {
  next(new BadRequestError('Test 400 - Bad request'));
});

// Test route for 401 error
router.get('/unauthorized', (req, res, next) => {
  next(new UnauthorizedError('Test 401 - Unauthorized'));
});

// Test route for 403 error
router.get('/forbidden', (req, res, next) => {
  next(new ForbiddenError('Test 403 - Forbidden'));
});

// Test route for 500 error
router.get('/server-error', (req, res, next) => {
  throw new Error('Test 500 - Internal server error');
});

// Test route for validation error
router.get('/validation-error', (req, res, next) => {
  const error: any = new Error('Validation failed');
  error.name = 'ValidationError';
  error.errors = {
    email: {
      message: 'Please provide a valid email',
      path: 'email'
    },
    password: {
      message: 'Password must be at least 8 characters long',
      path: 'password'
    }
  };
  next(error);
});

export default router;
