import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StreamerController } from './streamer.controller';
import { StreamerService } from './streamer.service';
import { Message } from '../schemas/message.schema';
import { RedisService } from '../redis/redis.service';

describe('StreamerController', () => {
  let controller: StreamerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamerController],
      providers: [
        StreamerService,
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

    controller = module.get<StreamerController>(StreamerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
