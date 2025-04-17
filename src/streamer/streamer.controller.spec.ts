import { Test, TestingModule } from '@nestjs/testing';
import { StreamerController } from './streamer.controller';
import { StreamerService } from './streamer.service';

describe('StreamerController', () => {
  let controller: StreamerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamerController],
      providers: [StreamerService],
    }).compile();

    controller = module.get<StreamerController>(StreamerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
