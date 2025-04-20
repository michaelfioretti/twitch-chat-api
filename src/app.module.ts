import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '@src/schemas/message.schema';

import { BitsModule } from '@src/bits/bits.module';
import { RedisService } from '@src/redis/redis.service';
import { BitsService } from '@src/bits/bits.service';
import { TasksService } from '@src/tasks/tasks.service';
import { ChatModule } from '@src/chat/chat.module';
import { StreamerModule } from '@src/streamer/streamer.module';
import {
  MAX_REQUEST_PER_IP,
  MAX_REQUEST_PER_IP_TTL_SECONDS,
} from '@src/common/constants';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: MAX_REQUEST_PER_IP_TTL_SECONDS * 1000,
          limit: MAX_REQUEST_PER_IP,
        },
      ],
    }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z9zf2.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`,
    ),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    BitsModule,
    ChatModule,
    StreamerModule,
  ],
  controllers: [],
  providers: [RedisService, BitsService, TasksService],
})
export class AppModule {}
