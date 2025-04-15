import { Channel } from 'src/common/entities/channel.entity';

export class GetBitsResponseDto {
  data: {
    timeframe: number;
    avgBits: number;
    channels: Channel[];
  };
}
