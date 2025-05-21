const logger = require('../utils/logger');
const { performance } = require('perf_hooks');

/**
 * Middleware to log all incoming requests and responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  // Skip logging for health checks and metrics
  if (req.path === '/health' || req.path === '/metrics') {
    return next();
  }

  const startTime = performance.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Add request ID to request and response
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Log request details
  const requestLog = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: Object.keys(req.query).length ? req.query : undefined,
    params: Object.keys(req.params).length ? req.params : undefined,
    headers: {
      'user-agent': req.headers['user-agent'],
      referer: req.headers.referer,
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    },
    body: req.body && Object.keys(req.body).length ? req.body : undefined,
    timestamp: new Date().toISOString(),
  };

  // Log request (excluding sensitive data in production)
  if (process.env.NODE_ENV === 'production') {
    const { body, headers, ...prodRequestLog } = requestLog;
    logger.info('Request received', {
      ...prodRequestLog,
      headers: {
        'user-agent': headers['user-agent'],
        'content-type': headers['content-type'],
        'content-length': headers['content-length'],
      },
    });
  } else {
    logger.info('Request received', requestLog);
  }

  // Store the original response methods
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;

  // Variables to store response data
  let responseSent = false;
  let responseBody;
  let responseStatus;

  // Override response methods to capture response data
  res.send = function (body) {
    if (!responseSent) {
      responseSent = true;
      responseBody = body;
      responseStatus = res.statusCode;
      logResponse();
    }
    return originalSend.apply(res, arguments);
  };

  res.json = function (body) {
    if (!responseSent) {
      responseSent = true;
      responseBody = body;
      responseStatus = res.statusCode;
      logResponse();
    }
    return originalJson.apply(res, arguments);
  };

  res.end = function (chunk, encoding) {
    if (!responseSent && chunk) {
      responseSent = true;
      responseBody = chunk;
      responseStatus = res.statusCode;
      logResponse();
    }
    return originalEnd.apply(res, arguments);
  };

  // Function to log the response
  const logResponse = () => {
    const responseTime = Math.round(performance.now() - startTime);
    
    const responseLog = {
      requestId,
      statusCode: responseStatus,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      headers: {
        'content-type': res.getHeader('content-type'),
        'content-length': res.getHeader('content-length'),
      },
      // Only include response body in non-production or for error responses
      body: process.env.NODE_ENV !== 'production' || responseStatus >= 400 ? responseBody : undefined,
    };

    // Log based on status code
    if (responseStatus >= 500) {
      logger.error('Server error response', responseLog);
    } else if (responseStatus >= 400) {
      logger.warn('Client error response', responseLog);
    } else {
      logger.info('Response sent', responseLog);
    }
  };

  // Log unhandled errors
  res.on('finish', () => {
    if (!responseSent) {
      responseStatus = res.statusCode;
      logResponse();
    }
  });

  // Continue to the next middleware
  next();
};

module.exports = requestLogger;
