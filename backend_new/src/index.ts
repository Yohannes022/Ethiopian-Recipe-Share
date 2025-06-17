// This must be the first import to ensure module aliases are set up correctly
import '@/config/module-alias';
import 'dotenv/config';

// Import models to ensure they're registered with Mongoose
import '@/models';
import http from 'http';
import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { connectDB } from '@/config/database';
import logger from '@/utils/logger';
import { AppError, errorHandler } from '@/middlewares/error.middleware';

// Create Express app
const app: Express = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Ethiopian Recipe Share API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
import healthRoutes from '@/routes/health.routes';
import testRoutes from '@/routes/test.routes';
import authRoutes from '@/routes/auth.routes';
import recipeRoutes from '@/routes/recipe.routes';
import profileRoutes from '@/routes/profile.routes';
import restaurantRoutes from '@/routes/restaurant.routes';
import menuItemRoutes from '@/routes/menuItem.routes';

// Mount routes
app.use('/api/v1', healthRoutes);
app.use('/api/test', testRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/recipes', recipeRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/menu-items', menuItemRoutes);

// API Routes will be mounted here
// app.use('/api/v1/users', userRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    logger.info('Starting server initialization...');
    
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectDB();
    logger.info('Successfully connected to MongoDB');
    
    // Try port 5001 if 5000 is in use
    const PORT = process.env.PORT || 5001;
    logger.info(`Attempting to start server on port ${PORT}...`);
    const NODE_ENV = process.env.NODE_ENV || 'development';
    
    logger.info(`Starting HTTP server on port ${PORT}...`);
    
    // Add error handler for the server
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
    // Start listening
    const serverInstance = server.listen(PORT, () => {
      const address = serverInstance.address();
      const host = address && typeof address === 'object' ? address.address : 'localhost';
      const port = address && typeof address === 'object' ? address.port : PORT;
      
      logger.info(`Server running in ${NODE_ENV} mode on ${host}:${port}`);
      logger.info(`MongoDB URI: ${process.env.MONGODB_URI?.split('@')[1]?.split('?')[0] || 'Not configured'}`);
      logger.info('Server is ready to handle requests');
      logger.info(`Access the API at http://localhost:${port}/api/v1`);
    });
    
    // Add listener for server errors after starting
    serverInstance.on('error', (error: NodeJS.ErrnoException) => {
      logger.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please stop the other process or use a different port.`);
      } else {
        logger.error('Unhandled server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
