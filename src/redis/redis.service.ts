// redis.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  onModuleInit() {
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const host = process.env.REDIS_HOST || '127.0.0.1';
    this.client = new Redis(port, host);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: any, ttlSeconds = 60): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
