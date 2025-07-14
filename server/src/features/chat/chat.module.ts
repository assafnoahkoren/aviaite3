// ChatModule.ts
// NestJS module for handling chat-related features

import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MessagesService } from './messages.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [ChatService, MessagesService],
  controllers: [ChatController],
  exports: [MessagesService],
})
export class ChatModule {} 