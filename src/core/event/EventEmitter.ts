import { EventEmitter as NodeEventEmitter } from 'events';
import { Logger } from '../../utils/Logger';
import { Socket } from 'socket.io';

// Define event types and their argument shapes
export interface EventMap {
  'client:connect': [Socket];
  'client:disconnect': [Socket];
  'chat:message': [Socket, any];
  // Add more events as needed
}

export interface EventHandler<T extends any[]> {
  handle(...args: T): void;
}

export class EventEmitter {
  private static instance: EventEmitter;
  private emitter: NodeEventEmitter;

  private constructor() {
    this.emitter = new NodeEventEmitter();
    // Limit max listeners to prevent memory leaks
    this.emitter.setMaxListeners(100);
    // Log errors for unhandled events
    this.emitter.on('error', (err) => {
      Logger.error(`EventEmitter error: ${err.message}`);
    });
  }

  public static getInstance(): EventEmitter {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }

  public on<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]> | ((...args: EventMap[K]) => void)
  ): void {
    const wrappedHandler = (...args: EventMap[K]) => {
      try {
        if (typeof handler === 'function') {
          handler(...args);
        } else {
          handler.handle(...args);
        }
      } catch (err) {
        Logger.error(`Error handling event ${String(event)}: ${(err as Error).message}`);
      }
    };
    this.emitter.on(event, wrappedHandler as (...args: any[]) => void);
  }

  public emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]): void {
    Logger.debug(`Emitting event ${String(event)} with args: ${JSON.stringify(args)}`);
    this.emitter.emit(event, ...args);
  }

  public off<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]> | ((...args: EventMap[K]) => void)
  ): void {
    this.emitter.off(event, handler as (...args: any[]) => void);
  }
}