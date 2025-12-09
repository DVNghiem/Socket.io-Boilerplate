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
      let workerPath: string;

      try {
        // Try to resolve using alias first (development)
        workerPath = require.resolve('@workers/WorkerThread');
      } catch (error) {
        // Fallback to relative path (production)
        const path = require('path');
        workerPath = path.join(__dirname, '../WorkerThread.js');
        Logger.info(`Using fallback worker path: ${workerPath}`);
      }

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