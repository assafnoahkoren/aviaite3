// chat.controller.ts
// Controller for handling chat-related HTTP requests

import { Controller, Get, Post, Body, Param, Req, UseGuards, Sse, Delete, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetChatsByFilterDto } from './dto/get-chats-by-filter.dto';
import { AuthGuard, AuthedRequest } from '../users/auth.guard';
import { Observable } from 'rxjs';
import { GetChatsByFilterOptions } from './chat.types';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('api/chat/assistants')
  listAssistants() {
    return this.chatService.listAllAssistants();
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
  @Post('api/chat/filter')
  async getChatsByFilter(@Body() dto: GetChatsByFilterDto) {
    const options: GetChatsByFilterOptions = {
      filter: dto.filter ? {
        userIds: dto.filter.userIds,
        fromCreatedAt: dto.filter.fromCreatedAt ? new Date(dto.filter.fromCreatedAt) : undefined,
        toCreatedAt: dto.filter.toCreatedAt ? new Date(dto.filter.toCreatedAt) : undefined,
      } : undefined,
      orderBy: dto.orderBy,
      pagination: dto.pagination,
    };
    return await this.chatService.getChatsByFilter(options);
  }

  @UseGuards(AuthGuard)
  @Delete('api/chat/:threadId')
  async softDeleteChat(
    @Param('threadId') threadId: string,
    @Req() req: AuthedRequest,
  ) {
    return await this.chatService.softDeleteChat(threadId, req.user.id);
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

  @UseGuards(AuthGuard)
  @Sse('api/chat/stream/:threadId')
  stream(@Param('threadId') threadId: string, @Req() req: AuthedRequest): Observable<any> {
    return new Observable((observer) => {
      this.chatService.createStream(threadId, req.user.id)
        .then(s => {
          s.on('textCreated', (text) => {
            observer.next({ data: { type: 'textCreated', value: text } });
          });
          s.on('textDelta', (delta) => {
            observer.next({ data: { type: 'textDelta', value: delta.value } });
          });
          s.on('toolCallCreated', (toolCall) => {
            observer.next({ data: { type: 'toolCallCreated', value: toolCall } });
          });
          s.on('toolCallDelta', (toolCallDelta) => {
            observer.next({ data: { type: 'toolCallDelta', value: toolCallDelta } });
          });
          s.on('end', () => {
            observer.next({ data: { type: 'end' } });
            observer.complete();
          });
          s.on('error', (error) => {
            // Send error through SSE before closing
            observer.next({ 
              data: { 
                type: 'error', 
                value: error.message || 'Stream error occurred' 
              } 
            });
            observer.complete();
          });
        })
        .catch(error => {
          // Handle errors from createStream (e.g., subscription errors)
          if (error.response && error.response.statusCode === 403) {
            observer.next({ 
              data: { 
                type: 'error', 
                value: 'Subscription required',
                code: 'SUBSCRIPTION_REQUIRED',
                details: error.response 
              } 
            });
          } else {
            observer.next({ 
              data: { 
                type: 'error', 
                value: error.message || 'Failed to start stream' 
              } 
            });
          }
          observer.complete();
        });
    });
  }

  @Get('api/chat/thread/:threadId/messages')
  async getChatMessages(@Param('threadId') threadId: string) {
    return await this.chatService.getChatMessages(threadId);
  }

  @UseGuards(AuthGuard)
  @Post('api/chat/thread/:threadId/generate-name')
  async generateChatName(
    @Param('threadId') threadId: string,
    @Req() req: AuthedRequest,
  ) {
    return await this.chatService.generateChatName(threadId, req.user.id);
  }
}