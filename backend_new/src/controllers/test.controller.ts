import { Request, Response } from 'express';
import User from '@/models/user.model';

/**
 * @desc    Test database connection by creating a test user
 * @route   GET /api/test/db
 * @access  Public
 */
export const testDB = async (req: Request, res: Response) => {
  try {
    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'test1234',
      role: 'user',
    });

    // Remove password from output
    const user = testUser.toObject();
    // Create a new object without the password
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      message: 'Database connection successful!',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Database test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all users (for testing)
 * @route   GET /api/test/users
 * @access  Public
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
