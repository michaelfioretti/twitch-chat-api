/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { ChatService } from './chat.service';
import { RedisService } from '../redis/redis.service';
import { Message } from '../schemas/message.schema';
import { GetChatDto } from './dto/get-chat.dto';
import { GET_CHAT_KEY, GET_CHAT_TTL_SECONDS } from '../common/constants';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: RedisService,
          useValue: {
            buildKey: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: getModelToken(Message.name),
          useValue: {
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return cached data if available in Redis', async () => {
    const mockRedisKey = 'mockRedisKey';
    const mockRedisData = JSON.stringify({ data: 'mockData' });

    jest
      .spyOn(service['redisService'], 'buildKey')
      .mockReturnValue(mockRedisKey);
    jest.spyOn(service['redisService'], 'get').mockResolvedValue(mockRedisData);

    const getChatDto: GetChatDto = { channels: 'channel1', timeframe: 3600 };
    const result = await service.getChat(getChatDto);

    expect(service['redisService'].buildKey).toHaveBeenCalledWith(
      GET_CHAT_KEY,
      getChatDto,
    );
    expect(service['redisService'].get).toHaveBeenCalledWith(mockRedisKey);
    expect(result).toEqual({ data: JSON.parse(mockRedisData) });
  });

  it('should query the database and return aggregated data if no cache is found', async () => {
    const mockRedisKey = 'mockRedisKey';
    const mockDbResult = [
      {
        totalMessages: 10,
        channels: ['channel1', 'channel2'],
        users: ['user1', 'user2'],
      },
    ];

    jest
      .spyOn(service['redisService'], 'buildKey')
      .mockReturnValue(mockRedisKey);
    jest.spyOn(service['redisService'], 'get').mockResolvedValue(null);
    jest.spyOn(service['messageModel'], 'aggregate').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDbResult),
    } as any);
    jest.spyOn(service['redisService'], 'set').mockResolvedValue();

    const getChatDto: GetChatDto = {
      channels: 'channel1,channel2',
      timeframe: 3600,
    };
    const result = await service.getChat(getChatDto);

    expect(service['redisService'].buildKey).toHaveBeenCalledWith(
      GET_CHAT_KEY,
      getChatDto,
    );
    expect(service['redisService'].get).toHaveBeenCalledWith(mockRedisKey);
    expect(service['messageModel'].aggregate).toHaveBeenCalledWith([
      {
        $match: {
          createdat: expect.any(Object),
          channel: { $in: ['channel1', 'channel2'] },
        },
      },
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
    ]);
    expect(service['redisService'].set).toHaveBeenCalledWith(
      mockRedisKey,
      {
        timeframe: 3600,
        totalMsg: 10,
        avgMsg: 5,
        channels: ['channel1', 'channel2'],
        users: 2,
      },
      GET_CHAT_TTL_SECONDS,
    );
    expect(result).toEqual({
      data: {
        timeframe: 3600,
        totalMsg: 10,
        avgMsg: 5,
        channels: ['channel1', 'channel2'],
        users: 2,
      },
    });
  });

  it('should return default data if no messages are found in the database', async () => {
    const mockRedisKey = 'mockRedisKey';

    jest
      .spyOn(service['redisService'], 'buildKey')
      .mockReturnValue(mockRedisKey);
    jest.spyOn(service['redisService'], 'get').mockResolvedValue(null);
    jest.spyOn(service['messageModel'], 'aggregate').mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    } as any);

    const getChatDto: GetChatDto = { channels: 'channel1', timeframe: 3600 };
    const result = await service.getChat(getChatDto);

    expect(service['redisService'].buildKey).toHaveBeenCalledWith(
      GET_CHAT_KEY,
      getChatDto,
    );
    expect(service['redisService'].get).toHaveBeenCalledWith(mockRedisKey);
    expect(service['messageModel'].aggregate).toHaveBeenCalled();
    expect(result).toEqual({
      data: {
        timeframe: 3600,
        totalMsg: 0,
        avgMsg: 0,
        channels: ['channel1'],
        users: [],
      },
    });
  });
});
