import { Module } from '@nestjs/common';
import { BitsService } from './bits.service';
import { BitsController } from './bits.controller';
import { RedisService } from 'src/redis/redis.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/schemas/message.schema';

@Module({
  controllers: [BitsController],
  providers: [BitsService, RedisService],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
})
export class BitsModule {}
