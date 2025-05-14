import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { config } from '../../../config';

export class RedisAdapter {
  private pubClient: Redis;
  private subClient: Redis;

  constructor() {
    this.pubClient = new Redis(config.redis);
    this.subClient = new Redis(config.redis);
  }

  public getAdapter() {
    return createAdapter(this.pubClient, this.subClient);
  }
}