import 'module-alias/register';
import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import app from '@/app';
import logger from '@/utils/logger';
import { initializeSocket } from '@/config/socket';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Connect to the database before starting the server
connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

export default server;
