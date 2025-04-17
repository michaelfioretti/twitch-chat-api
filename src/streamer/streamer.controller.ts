import { Controller, Get } from '@nestjs/common';
import { StreamerService } from './streamer.service';
import { GetTop10StreamersResponseDto } from './dto/get-top-10-streamers-response.dto';

@Controller('streamer')
export class StreamerController {
  constructor(private readonly streamerService: StreamerService) {}

  @Get('/top10')
  getTop10Streamers(): Promise<GetTop10StreamersResponseDto> {
    return this.streamerService.getTop10Streamers();
  }
}
