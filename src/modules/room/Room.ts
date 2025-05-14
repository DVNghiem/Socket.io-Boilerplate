import { Socket, Server } from 'socket.io';
import { SocketManager } from '../../core/socket/SocketManager';

export class Room {
  private id: string;
  private io: Server;

  constructor(id: string) {
    this.id = id;
    this.io = SocketManager.getInstance().getIO();
  }

  public join(socket: Socket) {
    socket.join(this.id);
  }

  public broadcast(socket: Socket, event: string, message: any) {
    this.io.to(this.id).emit(event, message);
  }
}