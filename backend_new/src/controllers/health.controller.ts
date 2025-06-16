import { Request, Response } from 'express';

/**
 * @desc    Health check endpoint
 * @route   GET /health
 * @access  Public
 */
export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
};
