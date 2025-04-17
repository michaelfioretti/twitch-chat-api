export class GetChatResponseDto {
  data: {
    timeframe: number;
    channels: string[];
    avgMsg: number;
    totalMsg: number;
  };
}
