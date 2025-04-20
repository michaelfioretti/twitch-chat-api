import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { BitsController } from './bits.controller';
import { BitsService } from './bits.service';
import { RedisService } from '../redis/redis.service';
import { Message } from '../schemas/message.schema';
import { GetBitsResponseDto } from './dto/get-bits-response.dto';
import { GetBitsDto } from './dto/get-bits.dto';

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

  it('should call getBits with correct parameters', async () => {
    const getBitsDto: GetBitsDto = { channels: 'channel1', timeframe: 3600 };
    const mockGetBits = jest
      .spyOn(controller['bitsService'], 'getBits')
      .mockResolvedValue({} as GetBitsResponseDto);

    await controller.getBits(getBitsDto);

    expect(mockGetBits).toHaveBeenCalledWith(getBitsDto);
  });
});
