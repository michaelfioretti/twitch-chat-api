import { Module } from '@nestjs/common';
import { BitsService } from './bits.service';
import { BitsController } from './bits.controller';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [BitsController],
  providers: [BitsService, RedisService],
})
export class BitsModule {}
