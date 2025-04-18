import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { Message } from 'src/schemas/message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { RedisService } from 'src/redis/redis.service';
import {
  MAX_STREAMERS_PER_USER_REQUEST,
  TWITCH_OAUTH_URL,
  TWITCH_USER_PROFILE_IMG_URL,
} from 'src/common/constants';
import axios, { AxiosResponse } from 'axios';
import { TwitchOauthResponse } from 'src/common/entities/twitch/twitch-oauth-response.entity';
import { TwitchStreamerInfoResponse } from 'src/common/entities/twitch/twitch-streamer-info-response.entity';

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

  @Cron('*/5 * * * *')
  async getStreamerMetadata() {
    this.logger.debug(
      'Fetching streamer metadata (profile image, description, etc)',
    );

    const streamers = await this.messageModel.distinct('channel').exec();
    this.logger.debug(`Found ${streamers.length} unique streamers`);

    const accessToken = await this.getTwitchAccessToken();

    const chunks: string[][] = [];
    for (let i = 0; i < streamers.length; i += MAX_STREAMERS_PER_USER_REQUEST) {
      chunks.push(streamers.slice(i, i + MAX_STREAMERS_PER_USER_REQUEST));
    }

    this.logger.debug(`Divided streamers into ${chunks.length} chunks`);

    const results: AxiosResponse[] = await Promise.all(
      chunks.map((chunk) =>
        axios.get(TWITCH_USER_PROFILE_IMG_URL, {
          params: { login: chunk },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID,
          },
        }),
      ),
    );

    const flattenedResults = results.flatMap(
      (result: AxiosResponse<TwitchStreamerInfoResponse>) => result.data.data,
    );

    this.logger.debug(`Fetched ${flattenedResults.length} profile images`);

    const msetData = {};
    for (const streamer of flattenedResults) {
      msetData[`streamer:image:${streamer.login}`] = streamer.profile_image_url;
      msetData[`streamer:description:${streamer.login}`] = streamer.description;
      msetData[`streamer:broadcaster_type:${streamer.login}`] =
        streamer.broadcaster_type;
    }

    await this.redisService.mset(msetData);
    this.logger.debug(`Updated cache with profile images`);
  }

  async getTwitchAccessToken(): Promise<string> {
    const response: AxiosResponse<TwitchOauthResponse> = await axios.post(
      TWITCH_OAUTH_URL,
      null,
      {
        params: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials',
        },
      },
    );

    return response.data.access_token;
  }
}
