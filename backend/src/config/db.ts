import mongoose from 'mongoose';
import logger from '@/utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    // Exit application on error if database connection fails
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
      process.exit(1);
    });

    // Log when the database is disconnected
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Log when the database is reconnected
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Close the Mongoose connection when the application is terminated
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    // Set mongoose options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    } as mongoose.ConnectOptions;

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`MongoDB connection error: ${error.message}`);
    } else {
      logger.error('An unknown error occurred while connecting to MongoDB');
    }
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
