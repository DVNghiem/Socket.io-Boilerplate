import { WorkerStrategy } from '../base/WorkerStrategy';

export class AnalyticsWorkerStrategy implements WorkerStrategy {
  name = 'analytics';

  process(message: any): any {
    // Logic analyze message content
    // For example, count the number of words in the message
    let wordCount = 0;
    if (typeof message.content === 'string') {
      wordCount = message.content.split(' ').length;
    }
    return { processed: true, data: message, wordCount };
  }
}