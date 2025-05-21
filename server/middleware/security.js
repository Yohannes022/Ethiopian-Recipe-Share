const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { createRateLimiter } = require('./rateLimiter');
const config = require('../config/config');

/**
 * Security middleware to apply various security measures
 * @returns {Array} Array of middleware functions
 */
const securityMiddleware = () => {
  const middleware = [];

  // Set security HTTP headers
  middleware.push(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            'https://maps.googleapis.com',
            'https://js.stripe.com',
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
          ],
          styleSrc: [
            "'self'",
            'https://fonts.googleapis.com',
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
            "'unsafe-inline'",
          ],
          fontSrc: [
            "'self'",
            'https://fonts.gstatic.com',
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
            'data:',
          ],
          imgSrc: [
            "'self'",
            'data:',
            'blob:',
            'https://*.tile.openstreetmap.org',
            'https://maps.googleapis.com',
            'https://*.stripe.com',
            'https://res.cloudinary.com',
            'https://via.placeholder.com',
          ],
          connectSrc: [
            "'self'",
            'https://api.stripe.com',
            'https://maps.googleapis.com',
            'ws://localhost:3000', // For development
            'wss://your-production-domain.com', // For production
          ],
          frameSrc: [
            "'self'",
            'https://js.stripe.com',
            'https://hooks.stripe.com',
          ],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: { policy: 'credentialless' },
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'no-referrer' },
      xssFilter: true,
    })
  );

  // Enable CORS
  middleware.push(
    cors({
      origin: config.cors.origin,
      methods: config.cors.methods,
      allowedHeaders: config.cors.allowedHeaders,
      credentials: config.cors.credentials,
      optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    })
  );

  // Prevent parameter pollution
  middleware.push(
    hpp({
      whitelist: [
        'price',
        'ratingsAverage',
        'ratingsQuantity',
        'duration',
        'difficulty',
        'maxGroupSize',
        'priceDiscount',
      ],
    })
  );

  // Data sanitization against XSS
  middleware.push(xss());

  // Data sanitization against NoSQL query injection
  middleware.push(
    mongoSanitize({
      onSanitize: ({ req, key }) => {
        console.warn(`This request[${key}] is sanitized`, req);
      },
    })
  );

  // Rate limiting
  if (config.env === 'production') {
    middleware.push(createRateLimiter(15 * 60 * 1000, 100, 'Too many requests from this IP, please try again in 15 minutes'));
  }

  return middleware;
};

module.exports = securityMiddleware;
