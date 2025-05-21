const cors = require('cors');
const config = require('../config/config');
const logger = require('../utils/logger');

// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://yourapp.com', // Production domain
  'https://www.yourapp.com', // Production domain with www
  'https://api.yourapp.com', // API domain if different
];

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin) || config.env === 'development') {
      return callback(null, true);
    }
    
    // Log unauthorized origins
    logger.warn(`CORS: Blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'Accept',
    'Origin',
    'X-Access-Token',
    'X-Refresh-Token',
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Request-ID',
    'X-Access-Token',
    'X-Refresh-Token',
  ],
  credentials: true, // Enable cookies and authentication headers
  maxAge: 600, // How long the results of a preflight request can be cached (in seconds)
  preflightContinue: false,
  optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Create the CORS middleware
const corsMiddleware = cors(corsOptions);

// Wrapper to handle preflight requests
const corsWithOptions = (req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    // Add CORS headers
    corsMiddleware(req, res, () => {});
    
    // End the request
    return res.status(204).end();
  }
  
  // For all other requests, use the CORS middleware
  return corsMiddleware(req, res, next);
};

module.exports = corsWithOptions;
