const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  env,
  port: process.env.PORT || 5000,
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRE || '30d',
    cookieExpire: process.env.JWT_COOKIE_EXPIRE || 30,
  },
  // OTP Configuration
  otp: {
    expiresInMinutes: parseInt(process.env.OTP_EXPIRE_MINUTES || '10'),
    length: parseInt(process.env.OTP_LENGTH || '6'),
    type: process.env.OTP_TYPE || 'numeric',
  },
  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: {
      email: process.env.FROM_EMAIL || 'noreply@ethiopianrecipes.com',
      name: process.env.FROM_NAME || 'Ethiopian Recipe Share',
    },
  },
  // Google Maps
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  // File Uploads
  uploads: {
    directory: path.join(__dirname, '../uploads'),
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ],
  },
};

const config = {
  development: {
    ...baseConfig,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ethiopian-recipe-share-dev',
    debug: true,
  },
  test: {
    ...baseConfig,
    mongoUri: process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/ethiopian-recipe-share-test',
    debug: false,
  },
  production: {
    ...baseConfig,
    mongoUri: process.env.MONGO_URI,
    debug: false,
  },
};

module.exports = config[env];
