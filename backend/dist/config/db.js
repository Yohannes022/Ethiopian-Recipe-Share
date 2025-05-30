"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("@/utils/logger"));
const connectDB = async () => {
    try {
        // Exit application on error if database connection fails
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.default.error(`MongoDB connection error: ${err}`);
            process.exit(1);
        });
        // Log when the database is disconnected
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.default.warn('MongoDB disconnected');
        });
        // Log when the database is reconnected
        mongoose_1.default.connection.on('reconnected', () => {
            logger_1.default.info('MongoDB reconnected');
        });
        // Close the Mongoose connection when the application is terminated
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            logger_1.default.info('MongoDB connection closed through app termination');
            process.exit(0);
        });
        // Set mongoose options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };
        // Connect to MongoDB
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI, options);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.default.error(`MongoDB connection error: ${error.message}`);
        }
        else {
            logger_1.default.error('An unknown error occurred while connecting to MongoDB');
        }
        // Exit process with failure
        process.exit(1);
    }
};
exports.default = connectDB;
