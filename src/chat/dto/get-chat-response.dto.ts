export class GetChatResponseDto {
  data: {
    timeframe: number;
    channels: string[];
    users: string[];
    avgMsg: number;
    totalMsg: number;
  };
}
