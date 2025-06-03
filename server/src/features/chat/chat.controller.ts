// chat.controller.ts
// Controller for handling chat-related HTTP requests

import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard, AuthedRequest } from '../users/auth.guard';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('api/chat/assistants')
  async listAssistants() {
    return await this.chatService.listAllAssistants();
  }

  @UseGuards(AuthGuard)
  @Post('api/chat')
  async createChat(
    @Body() createChatDto: CreateChatDto,
    @Req() req: AuthedRequest,
  ) {
    const { assistantId, profileId } = createChatDto;
    return await this.chatService.createChat(req.user.id, assistantId, profileId);
  }

  @UseGuards(AuthGuard)
  @Get('api/chat/user')
  async listChatsByUserId(@Req() req: AuthedRequest) {
    return await this.chatService.listChatsByUserId(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('api/chat/message')
  async createMessage(
    @Body() body: CreateMessageDto,
    @Req() req: AuthedRequest,
  ) {
    const { threadId, content } = body;
    return await this.chatService.createMessage(threadId, req.user.id, content);
  }

  @Get('api/chat/thread/:threadId/messages')
  async getChatMessages(@Param('threadId') threadId: string) {
    return await this.chatService.getChatMessages(threadId);
  }
}