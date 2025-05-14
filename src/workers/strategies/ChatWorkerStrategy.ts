import { WorkerStrategy } from '../base/WorkerStrategy';

export class ChatWorkerStrategy implements WorkerStrategy {
  name = 'chat';

  process(message: any): any {
    // Logic process message content
    // For example, check for spam or inappropriate content
    return { processed: true, data: message, type: 'chat' };
  }
}