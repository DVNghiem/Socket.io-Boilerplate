
export interface EventHandler<T extends any[]> {
  handle(...args: T): void;
}