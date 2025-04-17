import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisService } from 'src/redis/redis.service';
import { Message } from 'src/schemas/message.schema';
import { GetTop10StreamersResponseDto } from './dto/get-top-10-streamers-response.dto';
import {
  TOP_TEN_STREAMERS_KEY,
  TOP_TEN_STREAMERS_KEY_TTL_SECONDS,
  TWITCH_TV_URL,
} from 'src/common/constants';
import { Streamer } from 'src/common/entities/streamer.entity';

@Injectable()
export class StreamerService {
  private readonly logger = new Logger(StreamerService.name);
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly redisService: RedisService,
  ) {}

  async getTop10Streamers(): Promise<GetTop10StreamersResponseDto> {
    const redisKey = this.redisService.buildKey(TOP_TEN_STREAMERS_KEY);
    const redisStr = await this.redisService.get(redisKey);
    if (redisStr) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsedData: Streamer[] = JSON.parse(redisStr);

      return {
        data: parsedData,
      };
    }

    const result = await this.messageModel
      .aggregate([
        {
          $group: {
            _id: '$channel',
            totalMsgs: { $sum: 1 },
            totalBits: { $sum: '$bits' },
            modMsgs: {
              $sum: {
                $cond: [{ $eq: ['$mod', 1] }, 1, 0],
              },
            },
            subMsgs: {
              $sum: {
                $cond: [{ $eq: ['$subscribed', 1] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            totalMsgs: 1,
            totalBits: 1,
            avgBits: {
              $cond: [
                { $eq: ['$totalMsgs', 0] },
                0,
                { $divide: ['$totalBits', '$totalMsgs'] },
              ],
            },
            modPercentage: {
              $cond: [
                { $eq: ['$totalMsgs', 0] },
                0,
                { $multiply: [{ $divide: ['$modMsgs', '$totalMsgs'] }, 100] },
              ],
            },
            subPercentage: {
              $cond: [
                { $eq: ['$totalMsgs', 0] },
                0,
                { $multiply: [{ $divide: ['$subMsgs', '$totalMsgs'] }, 100] },
              ],
            },
          },
        },
        {
          $sort: { totalMsgs: -1 },
        },
        {
          $limit: 10,
        },
      ])
      .exec();

    const top10Streamers = result.map((streamer: Streamer) => {
      return {
        ...streamer,
        profile: `${TWITCH_TV_URL}${streamer.name}`,
      };
    });

    await this.redisService.set(
      TOP_TEN_STREAMERS_KEY,
      top10Streamers,
      TOP_TEN_STREAMERS_KEY_TTL_SECONDS,
    );

    return {
      data: top10Streamers,
    };
  }
}
