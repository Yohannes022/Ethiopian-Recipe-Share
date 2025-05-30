"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("@/middleware/errorHandler");
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const apiError_1 = require("@/utils/apiError");
const routes_1 = __importDefault(require("@/routes"));
const passport_1 = require("@/config/passport");
const cors_2 = require("@/config/cors");
const app = (0, express_1.default)();
// Initialize HTTP server
const server = (0, http_1.createServer)(app);
exports.server = server;
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
    cors: cors_2.corsOptions,
    pingTimeout: 60000,
});
// Set view engine
app.set('view engine', 'ejs');
app.set('views', 'src/views');
// Trust proxy
app.set('trust proxy', 1);
// Initialize Passport
(0, passport_1.initializePassport)();
// Implement CORS
app.use((0, cors_1.default)(cors_2.corsOptions));
// Set security HTTP headers
app.use((0, helmet_1.default)());
// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Body parser, reading data from body into req.body
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
// Cookie parser
app.use((0, cookie_parser_1.default)());
// Data sanitization against NoSQL query injection
app.use((0, express_mongo_sanitize_1.default)());
// Prevent parameter pollution
app.use((0, hpp_1.default)({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price',
    ],
}));
// Compress all responses
app.use((0, compression_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again in 15 minutes!',
});
app.use('/api', limiter);
// Routes
app.use('/api/v1', routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});
// Handle 404 - Not Found
app.all('*', (req, res, next) => {
    next(new apiError_1.NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Set io instance to be used in routes
app.set('io', io);
exports.default = app;
