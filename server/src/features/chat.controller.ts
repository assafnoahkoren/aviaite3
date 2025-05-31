// chat.controller.ts
// Controller for handling chat-related HTTP requests

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('api/chat/assistants')
  async listAssistants() {
    return await this.chatService.listAllAssistants();
  }

  @Post('api/chat')
  async createChat(
    @Body() createChatDto: CreateChatDto,
  ) {
    const { userId, assistantId, profileId } = createChatDto;
    return await this.chatService.createChat(userId, assistantId, profileId);
  }

  @Get('api/chat/user/:userId')
  async listChatsByUserId(@Param('userId') userId: string) {
    return await this.chatService.listChatsByUserId(userId);
  }
}