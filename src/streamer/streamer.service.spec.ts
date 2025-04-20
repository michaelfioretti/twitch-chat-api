import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { StreamerService } from './streamer.service';
import { RedisService } from '../redis/redis.service';
import { Message } from '../schemas/message.schema';

describe('StreamerService', () => {
  let service: StreamerService;

  beforeEach(async () => {
    const mockRedisService = {
      buildKey: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamerService,
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

    service = module.get<StreamerService>(StreamerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
