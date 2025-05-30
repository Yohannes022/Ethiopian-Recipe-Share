import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from '@/middleware/errorHandler';
import { NotFoundError } from '@/utils/apiError';
import routes from '@/routes';
import logger from '@/utils/logger';
import { initializePassport } from '@/config/passport';
import { corsOptions } from '@/config/cors';

const app: Application = express();

// Initialize HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Trust proxy
app.set('trust proxy', 1);

// Initialize Passport
initializePassport();

// Implement CORS
app.use(cors(corsOptions));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Compress all responses
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!',
});

app.use('/api', limiter);

// Routes
app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Handle 404 - Not Found
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// Error handling middleware
app.use(errorHandler);

// Set io instance to be used in routes
app.set('io', io);

export { server };
export default app;
