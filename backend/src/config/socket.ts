import { Server as SocketIOServer, Socket } from 'socket.io';
import http from 'http';
import logger from '@/utils/logger';

let io: SocketIOServer;

export const initializeSocket = (server: http.Server): void => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Handle connection events
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    // Add more socket event handlers here as needed
  });
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
