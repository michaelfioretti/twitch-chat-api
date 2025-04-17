/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisService } from 'src/redis/redis.service';
import { Message } from 'src/schemas/message.schema';
import { GetChatDto } from './dto/get-chat.dto';
import { GetChatResponseDto } from './dto/get-chat-response.dto';
import {
  GET_CHAT_KEY,
  GET_CHAT_TTL_SECONDS,
  MAX_TIMEFRAME,
} from 'src/common/constants';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly redisService: RedisService,
  ) {}

  async getChat(getChatDto: GetChatDto): Promise<GetChatResponseDto> {
    const redisKey = this.redisService.buildKey(GET_CHAT_KEY, getChatDto);
    const redisStr = await this.redisService.get(redisKey);
    if (redisStr) {
      return {
        data: JSON.parse(redisStr),
      };
    }

    const matchStage: Record<string, any> = {};

    const { channels, timeframe } = getChatDto;

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
            totalMessages: { $sum: 1 },
            channels: { $addToSet: '$channel' },
            users: { $addToSet: '$username' },
          },
        },
        {
          $project: {
            _id: 0,
            totalMessages: 1,
            channels: 1,
            users: 1,
          },
        },
      ])
      .exec();

    let avgMsgData = {
      timeframe: timeframe || MAX_TIMEFRAME,
      totalMsg: 0,
      avgMsg: 0,
      channels: channels?.split(',') || [],
      users: [],
    };

    if (!result || result.length === 0) {
      this.logger.warn('No messages found for the given criteria: ', redisKey);
      return {
        data: avgMsgData,
      };
    }

    const dbData = result[0];

    avgMsgData = {
      timeframe: timeframe || MAX_TIMEFRAME,
      totalMsg: dbData.totalMessages,
      avgMsg: +(dbData.totalMessages / (dbData.channels.length || 1)).toFixed(
        2,
      ),
      channels: dbData.channels,
      users: dbData.users.length,
    };

    await this.redisService.set(redisKey, avgMsgData, GET_CHAT_TTL_SECONDS);

    return {
      data: avgMsgData,
    };
  }
}
