import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { TasksService } from './tasks.service';
import { RedisService } from '../redis/redis.service';
import { Message } from '../schemas/message.schema';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
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

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
