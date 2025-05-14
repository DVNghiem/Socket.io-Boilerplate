import { Socket } from 'socket.io';
import { EventHandler } from '../EventHandler';
import { ChatStrategy } from '../../strategy/strategies/ChatStrategy';

export class ChatMessageHandler implements EventHandler<[Socket, any]> {
  private strategy = new ChatStrategy();

  handle(socket: Socket, message: any): void {
    this.strategy.process(socket, message);
  }
}