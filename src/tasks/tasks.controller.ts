import { Controller, Get } from '@nestjs/common';
import { TasksService } from '@src/tasks/tasks.service';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('stats')
  async getStats() {
    return this.tasksService.getStats();
  }

  @Get('streamer-metadata')
  async getStreamerMetadata() {
    return this.tasksService.getStreamerMetadata();
  }
}
