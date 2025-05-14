import { SocketManager } from './core/socket/SocketManager';
import { EventEmitter } from './core/event/EventEmitter';
import { EventHandler } from './core/event/EventHandler';
import { ChatStrategy } from './core/strategy/strategies/ChatStrategy';
import { RoomFactory } from './modules/room/RoomFactory';
import { Socket } from 'socket.io';

class ChatHandler implements EventHandler {
  private strategy = new ChatStrategy();

  handle(socket: Socket, ...args: any[]): void {
    const message = args[0];
    this.strategy.process(socket, message);
  }
}

SocketManager.getInstance();

EventEmitter.on('client:connect', {
  handle: (socket: Socket) => {
    socket.on('join:room', (roomId: string) => {
      const room = RoomFactory.getRoom(roomId);
      room.join(socket);
    });
    socket.on('chat:message', (message: any) => {
      EventEmitter.emit('chat:message', socket, message);
    });
  },
});
EventEmitter.on('chat:message', new ChatHandler());