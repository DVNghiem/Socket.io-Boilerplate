export interface WorkerStrategy {
  name: string;
  process(message: any): any;
}