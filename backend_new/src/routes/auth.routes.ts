import { Router } from 'express';
import { register, login, logout, getMe } from '@/controllers/auth.controller';

export const authRouter = Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);

// Protected routes (require authentication)
authRouter.get('/logout', logout);
authRouter.get('/me', getMe);

export default authRouter;
