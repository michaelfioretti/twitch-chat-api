import { Controller, Get, Query } from '@nestjs/common';
import { BitsService } from './bits.service';
import { GetBitsDto } from './dto/get-bits.dto';
import { GetBitsResponseDto } from './dto/get-bits-response.dto';

@Controller('bits')
export class BitsController {
  constructor(private readonly bitsService: BitsService) {}

  @Get()
  getBits(@Query() getBitsDto: GetBitsDto): Promise<GetBitsResponseDto> {
    return this.bitsService.getBits(getBitsDto);
  }
}
