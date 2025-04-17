import { Injectable, Logger } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { Message } from 'src/schemas/message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { RedisService } from 'src/redis/redis.service';

import { GetTotalMessagesAndBitsDto } from './dto/get-total-messages-and-bits.dto';
import {
  TOTAL_MESSAGES_AND_BITS_KEY,
  TOTAL_MESSAGES_AND_BITS_TTL_SECONDS,
} from 'src/common/constants';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly redisService: RedisService,
  ) {
    this.logger.debug('TasksService initialized');
  }

  // @Cron('*/5 * * * *')
  async updateTotalAvgBits() {
    this.logger.debug('Updating total average bits...');
    const t1 = performance.now();
    await this.updateTotalMessageCountAndAverageBits();
    this.logger.debug(`Function ran in ${performance.now() - t1} milliseconds`);
  }

  /**
   * Aggregates data from the `Message` collection to calculate the total message count
   * and total bits, then stores the result in Redis.
   *
   * @returns A promise that resolves when the data has been successfully updated in Redis.
   */
  async updateTotalMessageCountAndAverageBits() {
    const result = await this.messageModel
      .aggregate<GetTotalMessagesAndBitsDto>([
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            totalBits: { $sum: '$bits' },
          },
        },
        {
          $project: {
            _id: 0,
            totalRecords: 1,
            totalBits: 1,
          },
        },
      ])
      .exec();

    const data = result[0];

    await this.redisService.set(
      TOTAL_MESSAGES_AND_BITS_KEY,
      data,
      TOTAL_MESSAGES_AND_BITS_TTL_SECONDS,
    );
  }
}
