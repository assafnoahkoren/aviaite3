// chat.controller.ts
// Controller for handling chat-related HTTP requests

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

interface CreateMessageDto {
  threadId: string;
  userId: string;
  content: string;
}

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

  @Post('api/chat/message')
  async createMessage(
    @Body() body: CreateMessageDto,
  ) {
    const { threadId, userId, content } = body;
    return await this.chatService.createMessage(threadId, userId, content);
  }

  @Get('api/chat/thread/:threadId/messages')
  async getChatMessages(@Param('threadId') threadId: string) {
    return await this.chatService.getChatMessages(threadId);
  }
}