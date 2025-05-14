import { Socket } from 'socket.io';
import { EventHandler } from './EventHandler';

export class EventEmitter {
  private static handlers: Map<string, EventHandler[]> = new Map();

  public static on(event: string, handler: EventHandler) {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  public static emit(event: string, socket: Socket, ...args: any[]) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach((handler) => handler.handle(socket, ...args));
  }
}