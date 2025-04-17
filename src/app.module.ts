/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BitsModule } from './bits/bits.module';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis/redis.service';
import { BitsService } from './bits/bits.service';
import { TasksService } from './tasks/tasks.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    BitsModule,
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z9zf2.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`,
    ),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService, BitsService, TasksService],
})
export class AppModule {}
