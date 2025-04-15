import { Injectable } from '@nestjs/common';
import { GetBitsDto } from './dto/get-bits.dto';
import { GetBitsResponseDto } from './dto/get-bits-response.dto';

@Injectable()
export class BitsService {
  private bits = {
    timeframe: 100,
    avgBits: 100,
    channels: [
      {
        name: 'streamer name',
        url: 'streamer img',
        profileImg: 'streamer profile img',
      },
    ],
  };

  getBits(getBitsDto: GetBitsDto): GetBitsResponseDto {
    console.log(getBitsDto);
    return { data: this.bits };
  }
}
