import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GetChatResponseDto } from './dto/get-chat-response.dto';
import { GetChatDto } from './dto/get-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getChat(@Query() getChatDto: GetChatDto): Promise<GetChatResponseDto> {
    return this.chatService.getChat(getChatDto);
  }
}
