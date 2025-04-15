import { Module } from '@nestjs/common';
import { BitsService } from './bits.service';
import { BitsController } from './bits.controller';

@Module({
  controllers: [BitsController],
  providers: [BitsService],
})
export class BitsModule {}
