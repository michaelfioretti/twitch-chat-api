import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      this.client = new Redis();
      return;
    }

    this.client = new Redis({
      host: process.env.REDIS_HOST,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      port: Number(process.env.REDIS_PORT),
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: any, ex?: number): Promise<void> {
    if (ex) {
      await this.client.set(key, JSON.stringify(value), 'EX', ex);
      return;
    }

    await this.client.set(key, JSON.stringify(value));
  }

  async mset(data: Record<string, string>): Promise<void> {
    await this.client.mset(...Object.entries(data).flat());
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  buildKey(key: string, obj?: Record<string, any>): string {
    if (!obj) {
      return key;
    }

    if (!Object.keys(obj).length) {
      return key;
    }

    const sortedKeys = Object.keys(obj).sort();
    const keyParts = sortedKeys.map((k) => `${k}:${obj[k]}`);
    return `${key}:${keyParts.join(':')}`;
  }
}
