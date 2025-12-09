import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { config } from '../../../config';
import { Logger } from '../../../utils/Logger';

export class RedisAdapter {
  private pubClient: Redis;
  private subClient: Redis;

  constructor() {
    this.pubClient = this.createRedisClient('Publisher');
    this.subClient = this.createRedisClient('Subscriber');
    this.setupEventHandlers();
  }

  private createRedisClient(clientType: string): Redis {
    const client = new Redis({
      ...config.redis,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        Logger.info(`Redis ${clientType}: Retrying connection in ${delay}ms (attempt ${times})`);
        return delay;
      },
      reconnectOnError: (err) => {
        Logger.error(`Redis ${clientType} reconnect on error: ${err.message}`);
        return true;
      },
    });

    return client;
  }

  private setupEventHandlers(): void {
    // Publisher client events
    this.pubClient.on('connect', () => {
      Logger.info('Redis Publisher: Connected successfully');
    });

    this.pubClient.on('ready', () => {
      Logger.info('Redis Publisher: Ready to accept commands');
    });

    this.pubClient.on('error', (err) => {
      Logger.error(`Redis Publisher error: ${err.message}`);
    });

    this.pubClient.on('close', () => {
      Logger.info('Redis Publisher: Connection closed');
    });

    this.pubClient.on('reconnecting', () => {
      Logger.info('Redis Publisher: Reconnecting...');
    });

    // Subscriber client events
    this.subClient.on('connect', () => {
      Logger.info('Redis Subscriber: Connected successfully');
    });

    this.subClient.on('ready', () => {
      Logger.info('Redis Subscriber: Ready to accept commands');
    });

    this.subClient.on('error', (err) => {
      Logger.error(`Redis Subscriber error: ${err.message}`);
    });

    this.subClient.on('close', () => {
      Logger.info('Redis Subscriber: Connection closed');
    });

    this.subClient.on('reconnecting', () => {
      Logger.info('Redis Subscriber: Reconnecting...');
    });
  }

  public getAdapter() {
    return createAdapter(this.pubClient, this.subClient);
  }

  public async disconnect(): Promise<void> {
    Logger.info('Disconnecting Redis clients...');
    await Promise.all([
      this.pubClient.quit(),
      this.subClient.quit(),
    ]);
    Logger.info('Redis clients disconnected');
  }
}