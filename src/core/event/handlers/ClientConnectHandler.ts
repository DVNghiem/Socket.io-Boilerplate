import { Socket } from 'socket.io';
import { EventHandler } from '../EventHandler';
import { RoomFactory } from '../../../modules/room/RoomFactory';
import { EventEmitter } from '../EventEmitter';

export class ClientConnectHandler implements EventHandler<[Socket]> {
  handle(socket: Socket): void {
    socket.on('join:room', (roomId: string) => {
      const room = RoomFactory.getRoom(roomId);
      room.join(socket);
    });
    socket.on('chat:message', (message: any) => {
      EventEmitter.getInstance().emit('chat:message', socket, message);
    });
  }
}