"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = __importDefault(require("@/utils/logger"));
let io;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? process.env.CLIENT_URL
                : 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        logger_1.default.info(`New client connected: ${socket.id}`);
        // Handle connection events
        socket.on('disconnect', () => {
            logger_1.default.info(`Client disconnected: ${socket.id}`);
        });
        // Add more socket event handlers here as needed
    });
};
exports.initializeSocket = initializeSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
