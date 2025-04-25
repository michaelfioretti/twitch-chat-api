import { Controller, Get } from '@nestjs/common';
import { RedisService } from '@src/redis/redis.service';
import { TasksService } from '@src/tasks/tasks.service';

interface RedisStats {
  [key: string]: unknown;
}

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly redisService: RedisService,
  ) {}

  @Get('stats')
  async getStats() {
    // Get all keys from Redis
    const keys = ['streamer:meta:*', 'top:streamers', 'bits:*', 'chat:*'];

    // Get values for all keys
    const stats: RedisStats = {};
    for (const key of keys) {
      const value = await this.redisService.get(key);
      if (value) {
        stats[key] = JSON.parse(value);
      }
    }

    return { data: stats };
  }
}
