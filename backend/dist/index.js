"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables first
require("dotenv/config");
// Import module alias configuration
require("./config/module-alias");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("@/app");
const logger_1 = __importDefault(require("@/utils/logger"));
const PORT = process.env.PORT || 5000;
// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.default.error(`Error: ${error.message}`);
            process.exit(1);
        }
    }
};
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.default.error(`Error: ${err.message}`);
    // Close server & exit process
    app_1.server.close(() => process.exit(1));
});
// Connect to the database before starting the server
connectDB().then(() => {
    app_1.server.listen(PORT, () => {
        logger_1.default.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
});
exports.default = app_1.server;
