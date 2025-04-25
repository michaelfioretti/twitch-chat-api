import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

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

  async mget(keys: string[]): Promise<string[]> {
    if (!keys.length) {
      return [];
    }
    const results = await this.client.mget(keys);
    return results.filter((result): result is string => result !== null);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
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
