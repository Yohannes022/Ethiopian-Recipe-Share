import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

// Define the shape of our environment variables
type EnvVariables = {
  // Server Configuration
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  
  // Database
  MONGODB_URI: string;
  MONGODB_NAME: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  
  // Email
  EMAIL_HOST?: string;
  EMAIL_PORT?: string;
  EMAIL_USERNAME?: string;
  EMAIL_PASSWORD?: string;
  EMAIL_FROM: string;
  
  // Redis
  REDIS_URL: string;
  
  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  
  // Frontend URL
  FRONTEND_URL: string;
  
  // API Keys
  GOOGLE_MAPS_API_KEY?: string;
};

// Type for the final config object
type Config = {
  [K in keyof EnvVariables]: EnvVariables[K] extends number ? number : string;
} & {
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
};

// Default values for development
const defaults: Partial<Record<keyof EnvVariables, string | number>> = {
  NODE_ENV: 'development',
  PORT: 5000,
  JWT_EXPIRES_IN: '1d',
  JWT_REFRESH_EXPIRES_IN: '7d',
  FRONTEND_URL: 'http://localhost:3000',
};

// Get environment variable with fallback
const getEnv = <K extends keyof EnvVariables>(
  key: K,
  defaultValue?: EnvVariables[K]
): EnvVariables[K] => {
  const value = process.env[key] as EnvVariables[K] | undefined;
  
  if (value !== undefined) {
    // If the value is a number, parse it
    if (typeof defaults[key] === 'number' && typeof value === 'string') {
      return (parseInt(value, 10) as unknown) as EnvVariables[K];
    }
    return value;
  }
  
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  
  if (process.env.NODE_ENV !== 'test') {
    console.warn(`⚠️  Missing required environment variable: ${key}`);
  }
  
  return '' as EnvVariables[K];
};

// Validate required environment variables
const requiredVars: (keyof EnvVariables)[] = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'EMAIL_FROM',
  'REDIS_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

// Check for missing required variables in non-test environments
if (process.env.NODE_ENV !== 'test') {
  const missingVars = requiredVars.filter(
    (key) => process.env[key] === undefined && defaults[key] === undefined
  );
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Build the config object
const config: Config = {
  // Server
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnv('PORT', 5000),
  
  // Database
  MONGODB_URI: getEnv('MONGODB_URI'),
  MONGODB_NAME: getEnv('MONGODB_NAME', 'ethiopian_recipe_share'),
  
  // JWT
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '1d'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),
  
  // Email
  EMAIL_HOST: getEnv('EMAIL_HOST', 'smtp.gmail.com'),
  EMAIL_PORT: getEnv('EMAIL_PORT', "587"),
  EMAIL_USERNAME: getEnv('EMAIL_USERNAME', ''),
  EMAIL_PASSWORD: getEnv('EMAIL_PASSWORD', ''),
  EMAIL_FROM: getEnv('EMAIL_FROM'),
  
  // Redis
  REDIS_URL: getEnv('REDIS_URL'),
  
  // Stripe
  STRIPE_SECRET_KEY: getEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: getEnv('STRIPE_WEBHOOK_SECRET'),
  
  // Frontend
  FRONTEND_URL: getEnv('FRONTEND_URL'),
  
  // API Keys
  GOOGLE_MAPS_API_KEY: getEnv('GOOGLE_MAPS_API_KEY', ''),
  
  // Helper properties
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};

export default config;
