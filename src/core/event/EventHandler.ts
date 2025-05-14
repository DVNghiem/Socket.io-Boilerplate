import { Socket } from 'socket.io';

export interface EventHandler {
  handle(socket: Socket, ...args: any[]): void;
}