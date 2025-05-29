import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';

const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState === 1) {
      // Perform a simple query to verify the connection
      await mongoose.connection.db.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const healthCheck = async (req: Request, res: Response) => {
  try {
    const dbStatus = await checkDatabaseConnection();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`,
      database: dbStatus ? 'connected' : 'disconnected',
      memoryUsage: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: memoryUsage.external ? `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB` : 'N/A',
      },
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
    };

    if (!dbStatus) {
      throw new AppError('Database connection failed', 503);
    }

    res.status(200).json(healthStatus);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Health check failed', 500);
  }
};

export const readinessCheck = async (req: Request, res: Response) => {
  try {
    const dbStatus = await checkDatabaseConnection();
    
    if (!dbStatus) {
      throw new AppError('Database not ready', 503);
    }
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Readiness check failed', 500);
  }
};

export const livenessCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
};
