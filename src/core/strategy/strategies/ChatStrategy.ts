import { Socket } from 'socket.io';
import { MessageStrategy } from '../MessageStrategy';
import { RoomFactory } from '../../../modules/room/RoomFactory';
import { WorkerManager } from '../../../workers/WorkerManager';
import { Logger } from '../../../utils/Logger';
import { v4 as uuidv4 } from 'uuid';

export class ChatStrategy implements MessageStrategy {
  private workerManager: WorkerManager;

  constructor() {
    this.workerManager = new WorkerManager();
  }

  async process(socket: Socket, message: any): Promise<void> {
    try {
      // Send message to worker for processing (using strategy 'chat')
      const taskId = uuidv4();
      await this.workerManager.processMessage(taskId, message, 'chat');

      // Broadcast message after processing
      const room = RoomFactory.getRoom(message.roomId);
      room.broadcast(socket, 'chat:message', message);
    } catch (error) {
      Logger.error(`ChatStrategy error: ${(error as Error).message}`);
    }
  }
}