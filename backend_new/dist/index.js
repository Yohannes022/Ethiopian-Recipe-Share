"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@/config/module-alias");
require("dotenv/config");
require("@/models");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = require("@/config/database");
const logger_1 = __importDefault(require("@/utils/logger"));
const error_middleware_1 = require("@/middlewares/error.middleware");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.default.info(message.trim()) } }));
}
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Ethiopian Recipe Share API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});
const health_routes_1 = __importDefault(require("@/routes/health.routes"));
const test_routes_1 = __importDefault(require("@/routes/test.routes"));
const auth_routes_1 = __importDefault(require("@/routes/auth.routes"));
const recipe_routes_1 = __importDefault(require("@/routes/recipe.routes"));
const profile_routes_1 = __importDefault(require("@/routes/profile.routes"));
const restaurant_routes_1 = __importDefault(require("@/routes/restaurant.routes"));
const menuItem_routes_1 = __importDefault(require("@/routes/menuItem.routes"));
app.use('/api/v1', health_routes_1.default);
app.use('/api/test', test_routes_1.default);
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/recipes', recipe_routes_1.default);
app.use('/api/v1/profiles', profile_routes_1.default);
app.use('/api/v1/restaurants', restaurant_routes_1.default);
app.use('/api/v1/menu-items', menuItem_routes_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
app.use((req, res, next) => {
    next(new error_middleware_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(error_middleware_1.errorHandler);
const startServer = async () => {
    try {
        logger_1.default.info('Starting server initialization...');
        logger_1.default.info('Connecting to MongoDB...');
        await (0, database_1.connectDB)();
        logger_1.default.info('Successfully connected to MongoDB');
        const PORT = process.env.PORT || 5001;
        logger_1.default.info(`Attempting to start server on port ${PORT}...`);
        const NODE_ENV = process.env.NODE_ENV || 'development';
        logger_1.default.info(`Starting HTTP server on port ${PORT}...`);
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            switch (error.code) {
                case 'EACCES':
                    logger_1.default.error(`Port ${PORT} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger_1.default.error(`Port ${PORT} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
        const serverInstance = server.listen(PORT, () => {
            const address = serverInstance.address();
            const host = address && typeof address === 'object' ? address.address : 'localhost';
            const port = address && typeof address === 'object' ? address.port : PORT;
            logger_1.default.info(`Server running in ${NODE_ENV} mode on ${host}:${port}`);
            logger_1.default.info(`MongoDB URI: ${process.env.MONGODB_URI?.split('@')[1]?.split('?')[0] || 'Not configured'}`);
            logger_1.default.info('Server is ready to handle requests');
            logger_1.default.info(`Access the API at http://localhost:${port}/api/v1`);
        });
        serverInstance.on('error', (error) => {
            logger_1.default.error('Server error:', error);
            if (error.code === 'EADDRINUSE') {
                logger_1.default.error(`Port ${PORT} is already in use. Please stop the other process or use a different port.`);
            }
            else {
                logger_1.default.error('Unhandled server error:', error);
            }
            process.exit(1);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
process.on('unhandledRejection', (err) => {
    logger_1.default.error(`Unhandled Rejection: ${err.message}`);
    logger_1.default.error(err.stack);
    server.close(() => process.exit(1));
});
process.on('uncaughtException', (err) => {
    logger_1.default.error(`Uncaught Exception: ${err.message}`);
    logger_1.default.error(err.stack);
    server.close(() => process.exit(1));
});
startServer().catch((error) => {
    logger_1.default.error('Failed to start server:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map