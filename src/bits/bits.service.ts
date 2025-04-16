import { Injectable } from '@nestjs/common';
import { GetBitsDto } from './dto/get-bits.dto';
import { GetBitsResponseDto } from './dto/get-bits-response.dto';
import { RedisService } from 'src/redis/redis.service';
import { TOTAL_MESSAGES_AND_BITS_KEY } from 'src/common/constants';

@Injectable()
export class BitsService {
  constructor(private readonly redisService: RedisService) {}

  async getBits(getBitsDto: GetBitsDto): Promise<any> {
    console.log(getBitsDto);
    // First check redis
    const redisData = await this.redisService.get(TOTAL_MESSAGES_AND_BITS_KEY);
    if (redisData) {
      console.log(redisData)
      return {
        data: {
          timeframe: 0,
          channels: [],
          avgBits: 1,
        },
      };
    }

    return {
      data: {
        timeframe: 100,
        channels: [],
        avgBits: 100,
      },
    };
  }
}
