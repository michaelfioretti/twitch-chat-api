import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '@src/schemas/message.schema';
import { TasksController } from '@src/tasks/tasks.controller';
import { TasksService } from '@src/tasks/tasks.service';
import { RedisModule } from '@src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    RedisModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
