import { Worker } from 'worker_threads';
import { Redis } from 'ioredis';
import { config } from '../../config';
import { Logger } from '../../utils/Logger';
import { WorkerStrategy } from './WorkerStrategy';

interface WorkerData {
  taskId: string;
  message: any;
  strategy: string;
}

interface WorkerResult {
  taskId: string;
  result: any;
  error?: string;
}

export abstract class WorkerBase {
  protected redisPub: Redis;

  constructor() {
    this.redisPub = new Redis(config.redis);
  }

  public async process(taskId: string, message: any, strategy: WorkerStrategy): Promise<void> {
    return new Promise((resolve, reject) => {
      // Using require.resolve to get the path to WorkerThread via alias
      const workerPath = require.resolve('@workers/WorkerThread');

      const worker = new Worker(workerPath, {
        workerData: { taskId, message, strategy: strategy.name },
      });

      worker.on('message', (result: WorkerResult) => {
        if (result.error) {
          Logger.error(`Worker error: ${result.error}`);
          reject(new Error(result.error));
        } else {
          this.redisPub.publish('worker:results', JSON.stringify(result));
          resolve();
        }
      });

      worker.on('error', (err) => {
        Logger.error(`Worker failed: ${err.message}`);
        reject(err);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          Logger.error(`Worker stopped with exit code ${code}`);
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
}