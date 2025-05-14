import { Socket } from 'socket.io';

export interface MessageStrategy {
  process(socket: Socket, message: any): Promise<void>;
}