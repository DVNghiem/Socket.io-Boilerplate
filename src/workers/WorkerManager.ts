import { WorkerBase } from './base/WorkerBase';
import { WorkerStrategy } from './base/WorkerStrategy';
import { ChatWorkerStrategy } from './strategies/ChatWorkerStrategy';
import { AnalyticsWorkerStrategy } from './strategies/AnalyticsWorkerStrategy';
import { Logger } from '../utils/Logger';

export class WorkerManager extends WorkerBase {
  private strategies: Map<string, WorkerStrategy>;

  constructor() {
    super();
    this.strategies = new Map();
    this.registerStrategies();
  }

  private registerStrategies() {
    this.strategies.set('chat', new ChatWorkerStrategy());
    this.strategies.set('analytics', new AnalyticsWorkerStrategy());
  }

  public async processMessage(taskId: string, message: any, strategyName: string): Promise<void> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Unknown strategy: ${strategyName}`);
    }
    try {
      await this.process(taskId, message, strategy);
    } catch (error) {
      Logger.error(`WorkerManager error: ${(error as Error).message}`);
      throw error;
    }
  }
}