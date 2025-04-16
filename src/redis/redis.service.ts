// redis.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  onModuleInit() {
    // const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    // console.log('redis port: ', port);
    // const host = process.env.REDIS_HOST || '127.0.0.1';
    // console.log('redis host: ', host);
    // this.client = new Redis(port, host);
    this.client = new Redis();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
