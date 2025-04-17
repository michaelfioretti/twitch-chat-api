/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { RedisService } from 'src/redis/redis.service';

import { Model } from 'mongoose';
import { Message } from 'src/schemas/message.schema';

import { GetBitsDto } from './dto/get-bits.dto';
import { GetBitsResponseDto } from './dto/get-bits-response.dto';

import {
  GET_BITS_KEY,
  GET_BITS_TTL_SECONDS,
  MAX_TIMEFRAME,
} from 'src/common/constants';

@Injectable()
export class BitsService {
  private readonly logger = new Logger(BitsService.name);

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly redisService: RedisService,
  ) { }

  async getBits(getBitsDto: GetBitsDto): Promise<GetBitsResponseDto> {
    const redisKey = this.redisService.buildKey(GET_BITS_KEY, getBitsDto);
    const redisStr = await this.redisService.get(redisKey);
    if (redisStr) {
      return {
        data: JSON.parse(redisStr),
      };
    }

    // Filter messages by the channels provided in the request and timeframe
    const matchStage: Record<string, any> = {};

    const { channels, timeframe } = getBitsDto;

    if (timeframe) {
      const since = new Date(Date.now() - timeframe * 1000);
      matchStage.createdat = { $gte: since };
    }

    if (channels && channels.length > 0) {
      matchStage.channel = { $in: channels.split(',') };
    }

    const result = await this.messageModel
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalBits: { $sum: '$bits' },
            channels: { $addToSet: '$channel' },
          },
        },
        {
          $project: {
            _id: 0,
            totalBits: 1,
            channels: 1,
          },
        },
      ])
      .exec();

    let avgBitsData = {
      timeframe: timeframe || MAX_TIMEFRAME,
      totalBits: 0,
      avgBits: 0,
      channels: channels?.split(',') || [],
    };

    await this.redisService.set(redisKey, avgBitsData, GET_BITS_TTL_SECONDS);

    if (!result || result.length === 0) {
      this.logger.warn('Query returned no results. Redis key: ', redisKey);
      return {
        data: avgBitsData,
      };
    }

    const dbData = result[0];
    avgBitsData = {
      timeframe: timeframe || MAX_TIMEFRAME,
      channels: dbData.channels,
      totalBits: dbData.totalBits,
      avgBits: +(dbData.totalBits / (dbData.channels.length || 1)).toFixed(2),
    };

    await this.redisService.set(redisKey, avgBitsData, GET_BITS_TTL_SECONDS);

    return {
      data: avgBitsData,
    };
  }
}
