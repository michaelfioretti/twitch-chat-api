export class GetBitsResponseDto {
  data: {
    timeframe: number;
    totalBits: number;
    avgBits: number;
    channels: string[];
  };
}
