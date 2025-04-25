import { Controller, Get } from '@nestjs/common';
import { RedisService } from '@src/redis/redis.service';
import { TasksService } from '@src/tasks/tasks.service';

@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly redisService: RedisService,
  ) {}

  @Get('stats')
  async getStats() {
    return this.tasksService.getStats();
  }
}
