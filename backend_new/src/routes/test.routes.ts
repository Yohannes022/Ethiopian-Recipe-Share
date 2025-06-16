import { Router } from 'express';
import { testDB, getUsers } from '@/controllers/test.controller';

const router = Router();

/**
 * @route   GET /api/test/db
 * @desc    Test database connection
 * @access  Public
 */
router.get('/db', testDB);

/**
 * @route   GET /api/test/users
 * @desc    Get all users (for testing)
 * @access  Public
 */
router.get('/users', getUsers);

export default router;
