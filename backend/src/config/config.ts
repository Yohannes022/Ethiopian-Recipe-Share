import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Type definitions for environment variables
export interface EnvConfig {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_COOKIE_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  NODE_ENV: 'development' | 'production' | 'test';
  MONGODB_URI: string;
  PORT: string;
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  JWT_REFRESH_SECRET: string;
}

// Validate required environment variables
const validateEnv = () => {
  const envVars: EnvConfig = {
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '',
    JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN || '',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    NODE_ENV: process.env.NODE_ENV as EnvConfig['NODE_ENV'] || 'development',
    MONGODB_URI: process.env.MONGODB_URI || '',
    PORT: process.env.PORT || '3000',
    EMAIL_HOST: process.env.EMAIL_HOST || '',
    EMAIL_PORT: process.env.EMAIL_PORT || '',
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
  };

  // Check for missing required environment variables
  const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];
  const missingVars = requiredVars.filter(varName => !envVars[varName as keyof EnvConfig]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return envVars;
};

// Export the validated environment variables
export const env = validateEnv();
