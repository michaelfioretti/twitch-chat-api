import { Test, TestingModule } from '@nestjs/testing';
import { BitsService } from './bits.service';

describe('BitsService', () => {
  let service: BitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BitsService],
    }).compile();

    service = module.get<BitsService>(BitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
