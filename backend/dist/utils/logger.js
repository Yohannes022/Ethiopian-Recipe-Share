"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = void 0;
const winston_1 = __importStar(require("winston"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
require("winston-daily-rotate-file");
// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}
// Define log levels and their colors
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
};
// Create the logger instance
const logger = winston_1.default.createLogger({
    levels: logLevels,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston_1.format.combine(winston_1.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
    defaultMeta: { service: 'ethiopian-recipe-share' },
    transports: [
        // Console transport
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize({ all: true }), winston_1.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)),
        }),
        // Daily rotate file transport for all logs
        new winston_1.default.transports.DailyRotateFile({
            filename: path.join(logDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
        // Error logs
        new winston_1.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
        })
    ],
    exceptionHandlers: [
        new winston_1.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
        }),
    ],
    rejectionHandlers: [
        new winston_1.transports.File({
            filename: path.join(logDir, 'rejections.log'),
        }),
    ],
});
// Add colors to winston
winston_1.default.addColors(logColors);
// Create a stream for morgan to pipe logs to winston
exports.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};
exports.default = logger;
