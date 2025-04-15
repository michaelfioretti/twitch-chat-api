export class GetBitsResponseDto {
  data: {
    timeframe: number;
    avgBits: number;
    channels: {
      name: string;
      url: string;
      profileImg: string;
    }[];
  };
}
