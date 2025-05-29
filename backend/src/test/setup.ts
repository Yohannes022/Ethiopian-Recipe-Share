import { config } from 'dotenv';
import path from 'path';
import { beforeAll, afterAll, beforeEach, afterEach, jest } from '@jest/globals';
import mongoose from 'mongoose';

// Load environment variables from .env.test
config({ path: path.resolve(process.cwd(), '.env.test') });

// Set up global test configurations
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Global test teardown
afterAll(async () => {
  // Close any open connections or resources here
  if (mongoose.connection) {
    await mongoose.connection.close();
  }
});

// Global test setup
beforeAll(async () => {
  // Connect to the test database
  const MONGODB_URI = 'mongodb://localhost:27017/testdb';
  await mongoose.connect(MONGODB_URI);
});

// Global before each test
beforeEach(async () => {
  // Setup code that runs before each test
});

// Global after each test
afterEach(async () => {
  // Cleanup code that runs after each test
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear database after each test
  if (mongoose.connection) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});
