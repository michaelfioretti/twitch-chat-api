import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { BitsController } from './bits.controller';
import { BitsService } from './bits.service';
import { RedisService } from '../redis/redis.service';
import { Message } from '../schemas/message.schema';

describe('BitsController', () => {
  let controller: BitsController;

  beforeEach(async () => {
    const mockRedisService = {
      buildKey: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BitsController],
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

    controller = module.get<BitsController>(BitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
