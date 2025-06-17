import mongoose, { Connection, Mongoose } from 'mongoose';
import logger from '@/utils/logger';

// Extend NodeJS global to include mongoose connection and promise
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using the URI from the environment variables.
 * In development, it uses a cached connection to prevent multiple connections.
 * In production, it creates a new connection.
 * @returns {Promise<Mongoose>} The Mongoose instance
 */
export const connectDB = async (): Promise<Mongoose> => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      const errorMsg = 'MongoDB connection URI is not defined in environment variables';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    logger.info(`Attempting to connect to MongoDB with URI: ${MONGODB_URI.split('@')[1]?.split('?')[0] || 'invalid_uri'}`);

    // In development, use a cached connection if available
    if (process.env.NODE_ENV === 'development') {
      if (cached.conn) {
        logger.info('Using cached database connection');
        return cached.conn;
      }

      if (!cached.promise) {
        logger.info('Creating new MongoDB connection...');
        const opts: mongoose.ConnectOptions = {
          bufferCommands: false,
          serverSelectionTimeoutMS: 10000, // Increased from 5000 to 10000
          socketTimeoutMS: 45000,
          connectTimeoutMS: 10000, // Added explicit connect timeout
        };

        try {
          cached.promise = mongoose.connect(MONGODB_URI, opts);
          logger.info('MongoDB connection promise created');
        } catch (connectError) {
          logger.error('Error creating MongoDB connection promise:', connectError);
          throw connectError;
        }
      }

      try {
        logger.info('Waiting for MongoDB connection to establish...');
        cached.conn = await cached.promise;
        logger.info('MongoDB connection established successfully');
        return cached.conn;
      } catch (connectionError) {
        logger.error('Error establishing MongoDB connection:', connectionError);
        throw connectionError;
      }
    }

    // In production, always create a new connection
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    } as mongoose.ConnectOptions);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`MongoDB connection error: ${error.message}`);
    } else {
      logger.error('An unknown error occurred while connecting to MongoDB');
    }
    
    // In production, exit the process if we can't connect to the database
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    // In development, re-throw the error to be handled by the caller
    throw error;
  }
};

// Handle Mongoose connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

// Graceful shutdown handler
const gracefulShutdown = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('Mongoose connection closed through app termination');
    process.exit(0);
  } catch (err) {
    logger.error('Error during application shutdown:', err);
    process.exit(1);
  }
};

// Listen for application termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Export mongoose instance
export default mongoose;
