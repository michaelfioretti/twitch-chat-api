import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TasksService } from './tasks.service';
import { RedisService } from '../redis/redis.service';
import { Message } from '../schemas/message.schema';
import { ChatStats } from '../common/entities/get-chat-stats.entity';

interface MockModel extends Model<Message> {
  aggregate: jest.Mock;
  exec: jest.Mock;
}

describe('TasksService', () => {
  let service: TasksService;
  let redisService: RedisService;
  let messageModel: MockModel;

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
            aggregate: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    redisService = module.get<RedisService>(RedisService);
    messageModel = module.get<MockModel>(getModelToken(Message.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getChatStats', () => {
    it('should return and cache chat statistics', async () => {
      const mockStats: ChatStats = {
        totalMessages: 100,
        uniqueUsers: 50,
        uniqueChannels: 10,
      };

      messageModel.exec.mockResolvedValue([mockStats]);
      const setSpy = jest.spyOn(redisService, 'set');

      await service.getChatStats();

      expect(messageModel.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            uniqueUsers: { $addToSet: '$username' },
            uniqueChannels: { $addToSet: '$channel' },
          },
        },
        {
          $project: {
            _id: 0,
            totalMessages: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            uniqueChannels: { $size: '$uniqueChannels' },
          },
        },
      ]);

      expect(setSpy).toHaveBeenCalledWith(
        'chat:stats',
        JSON.stringify(mockStats),
      );
    });

    it('should handle empty results', async () => {
      const defaultStats: ChatStats = {
        totalMessages: 0,
        uniqueUsers: 0,
        uniqueChannels: 0,
      };

      messageModel.exec.mockResolvedValue([]);
      const setSpy = jest.spyOn(redisService, 'set');

      await service.getChatStats();

      expect(setSpy).toHaveBeenCalledWith(
        'chat:stats',
        JSON.stringify(defaultStats),
      );
    });
  });
});
