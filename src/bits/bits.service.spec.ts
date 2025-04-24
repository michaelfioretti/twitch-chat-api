import { Test, TestingModule } from '@nestjs/testing';
import { BitsService } from './bits.service';
import { RedisService } from '../redis/redis.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { GetBitsDto } from './dto/get-bits.dto';
import { GET_BITS_KEY, GET_BITS_TTL_SECONDS } from '../common/constants';

describe('BitsService', () => {
  let service: BitsService;
  let redisService: RedisService;
  let messageModel: Model<Message>;

  beforeEach(async () => {
    const mockRedisService = {
      buildKey: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BitsService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: getModelToken(Message.name),
          useValue: {
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BitsService>(BitsService);
    redisService = module.get<RedisService>(RedisService);
    messageModel = module.get<Model<Message>>(getModelToken(Message.name));
  });

  it('should return cached data if available', async () => {
    const redisKey = 'test-key';
    const cachedData = {
      data: { totalBits: 100, avgBits: 50, channels: ['channel1'] },
    };

    jest.spyOn(redisService, 'buildKey').mockReturnValue(redisKey);
    jest
      .spyOn(redisService, 'get')
      .mockResolvedValue(JSON.stringify(cachedData.data));

    const getBitsDto: GetBitsDto = { channels: 'channel1', timeframe: 3600 };
    const result = await service.getBits(getBitsDto);

    expect(redisService.buildKey).toHaveBeenCalledWith(
      GET_BITS_KEY,
      getBitsDto,
    );
    expect(redisService.get).toHaveBeenCalledWith(redisKey);
    expect(result).toEqual(cachedData);
  });

  it('should query the database and return data if cache is empty', async () => {
    const redisKey = 'test-key';
    const dbResult = [
      {
        totalBits: 200,
        channels: ['channel1', 'channel2'],
      },
    ];

    jest.spyOn(redisService, 'buildKey').mockReturnValue(redisKey);
    jest.spyOn(redisService, 'get').mockResolvedValue(null);
    jest.spyOn(messageModel, 'aggregate').mockReturnValue({
      exec: jest.fn().mockResolvedValue(dbResult),
    } as any);
    jest.spyOn(redisService, 'set').mockResolvedValue();

    const getBitsDto: GetBitsDto = {
      channels: 'channel1,channel2',
      timeframe: 3600,
    };
    const result = await service.getBits(getBitsDto);

    expect(redisService.buildKey).toHaveBeenCalledWith(
      GET_BITS_KEY,
      getBitsDto,
    );
    expect(redisService.get).toHaveBeenCalledWith(redisKey);
    expect(messageModel.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          createdat: expect.any(Object),
          channel: { $in: ['channel1', 'channel2'] },
        },
      },
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
    ]);
    expect(redisService.set).toHaveBeenCalledWith(
      redisKey,
      {
        timeframe: 3600,
        totalBits: 200,
        avgBits: 100,
        channels: ['channel1', 'channel2'],
      },
      GET_BITS_TTL_SECONDS,
    );
    expect(result).toEqual({
      data: {
        timeframe: 3600,
        totalBits: 200,
        avgBits: 100,
        channels: ['channel1', 'channel2'],
      },
    });
  });

  it('should return default data if no results are found in the database', async () => {
    const redisKey = 'test-key';

    jest.spyOn(redisService, 'buildKey').mockReturnValue(redisKey);
    jest.spyOn(redisService, 'get').mockResolvedValue(null);
    jest.spyOn(messageModel, 'aggregate').mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    } as any);
    jest.spyOn(redisService, 'set').mockResolvedValue();

    const getBitsDto: GetBitsDto = { channels: 'channel1', timeframe: 3600 };
    const result = await service.getBits(getBitsDto);

    expect(redisService.buildKey).toHaveBeenCalledWith(
      GET_BITS_KEY,
      getBitsDto,
    );
    expect(redisService.get).toHaveBeenCalledWith(redisKey);
    expect(messageModel.aggregate).toHaveBeenCalled();
    expect(result).toEqual({
      data: {
        timeframe: 3600,
        totalBits: 0,
        avgBits: 0,
        channels: ['channel1'],
      },
    });
  });
});
