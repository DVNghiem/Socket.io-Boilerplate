import { SocketManager } from './core/socket/SocketManager';
import { EventEmitter } from './core/event/EventEmitter';
import { ClientConnectHandler } from './core/event/handlers/ClientConnectHandler';
import { ChatMessageHandler } from './core/event/handlers/ChatMessageHandler';
import { Logger } from './utils/Logger';

// Initialize SocketManager
SocketManager.getInstance();

// Register event handlers
EventEmitter.getInstance().on('client:connect', new ClientConnectHandler());
EventEmitter.getInstance().on('chat:message', new ChatMessageHandler());

Logger.info('Socket.IO server started');