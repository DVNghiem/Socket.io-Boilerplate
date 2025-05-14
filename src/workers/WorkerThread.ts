import { parentPort, workerData } from 'worker_threads';
import { ChatWorkerStrategy } from '@workers/strategies/ChatWorkerStrategy';
import { AnalyticsWorkerStrategy } from '@workers/strategies/AnalyticsWorkerStrategy';

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

const strategies = new Map<string, any>([
  ['chat', new ChatWorkerStrategy()],
  ['analytics', new AnalyticsWorkerStrategy()],
]);

if (parentPort) {
  const { taskId, message, strategy } = workerData as WorkerData;

  try {
    const workerStrategy = strategies.get(strategy);
    if (!workerStrategy) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }

    const result = workerStrategy.process(message);
    parentPort.postMessage({ taskId, result } as WorkerResult);
  } catch (error) {
    parentPort.postMessage({
      taskId,
      error: (error as Error).message,
    } as WorkerResult);
  }
}