import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { config } from '../../config';
import { RedisAdapter } from './adapters/RedisAdapter';
import { EventEmitter } from '../event/EventEmitter';
import { Logger } from '../../utils/Logger';
import uWS from 'uWebSockets.js';

export class SocketManager {
  private static instance: SocketManager;
  private io: Server;

  private constructor() {
    const app = uWS.App();
    this.io = new Server({
      cors: { origin: '*' },
      transports: ['websocket'], // Use WebSocket only for performance
    });

    // initialize Redis adapter
    const redisAdapter = new RedisAdapter();
    this.io.adapter(redisAdapter.getAdapter());

    // Bind Socket.IO to uWebSockets.js
    this.io.attachApp(app);

    // setup Redis event listeners
    this.setupEvents();

    // Start uWebSockets.js server
    app.listen(config.port, (token) => {
      if (token) {
        Logger.info(`Socket.IO server running on port ${config.port}`);
      } else {
        Logger.error(`Failed to listen on port ${config.port}`);
      }
    });
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public getIO(): Server {
    return this.io;
  }

  private setupEvents() {
    this.io.on('connection', (socket: Socket) => {
      Logger.info(`New client connected: ${socket.id}`);
      EventEmitter.emit('client:connect', socket);

      socket.on('disconnect', () => {
        Logger.info(`Client disconnected: ${socket.id}`);
        EventEmitter.emit('client:disconnect', socket);
      });
    });
  }
}