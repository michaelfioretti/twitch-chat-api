import { Test, TestingModule } from '@nestjs/testing';
import { BitsController } from './bits.controller';
import { BitsService } from './bits.service';

describe('BitsController', () => {
  let controller: BitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BitsController],
      providers: [BitsService],
    }).compile();

    controller = module.get<BitsController>(BitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
