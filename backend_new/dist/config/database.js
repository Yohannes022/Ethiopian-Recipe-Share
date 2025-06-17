"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("@/utils/logger"));
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            const errorMsg = 'MongoDB connection URI is not defined in environment variables';
            logger_1.default.error(errorMsg);
            throw new Error(errorMsg);
        }
        logger_1.default.info(`Attempting to connect to MongoDB with URI: ${MONGODB_URI.split('@')[1]?.split('?')[0] || 'invalid_uri'}`);
        if (process.env.NODE_ENV === 'development') {
            if (cached.conn) {
                logger_1.default.info('Using cached database connection');
                return cached.conn;
            }
            if (!cached.promise) {
                logger_1.default.info('Creating new MongoDB connection...');
                const opts = {
                    bufferCommands: false,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                    connectTimeoutMS: 10000,
                };
                try {
                    cached.promise = mongoose_1.default.connect(MONGODB_URI, opts);
                    logger_1.default.info('MongoDB connection promise created');
                }
                catch (connectError) {
                    logger_1.default.error('Error creating MongoDB connection promise:', connectError);
                    throw connectError;
                }
            }
            try {
                logger_1.default.info('Waiting for MongoDB connection to establish...');
                cached.conn = await cached.promise;
                logger_1.default.info('MongoDB connection established successfully');
                return cached.conn;
            }
            catch (connectionError) {
                logger_1.default.error('Error establishing MongoDB connection:', connectionError);
                throw connectionError;
            }
        }
        const conn = await mongoose_1.default.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.default.error(`MongoDB connection error: ${error.message}`);
        }
        else {
            logger_1.default.error('An unknown error occurred while connecting to MongoDB');
        }
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        throw error;
    }
};
exports.connectDB = connectDB;
mongoose_1.default.connection.on('connected', () => {
    logger_1.default.info('Mongoose connected to MongoDB');
});
mongoose_1.default.connection.on('error', (err) => {
    logger_1.default.error(`Mongoose connection error: ${err}`);
});
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.default.warn('Mongoose disconnected from MongoDB');
});
const gracefulShutdown = async () => {
    try {
        await mongoose_1.default.connection.close();
        logger_1.default.info('Mongoose connection closed through app termination');
        process.exit(0);
    }
    catch (err) {
        logger_1.default.error('Error during application shutdown:', err);
        process.exit(1);
    }
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
exports.default = mongoose_1.default;
//# sourceMappingURL=database.js.map