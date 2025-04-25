import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '@src/schemas/message.schema';
import { TasksController } from '@src/tasks/tasks.controller';
import { TasksService } from '@src/tasks/tasks.service';
import { RedisService } from '@src/redis/redis.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class TasksModule {}
