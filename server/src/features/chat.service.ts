// chat.service.ts
// Service for handling chat logic

import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ENV } from '../env';
import { prisma } from '../prisma';

const assistants = [
	{
		id: 'asst_DBVI33JWzoqmwjT5HsyKrIcB',
		name: 'shirgal',
		label: 'Shirgal',
	},
	{
		id: 'asst_1ZN4h0qheVLr7rpqaibRiHw9',
		name: 'elal-7787',
		label: 'Elal 7787',
	},	
]

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
  }

  async listAllAssistants() {
    // Returns a list of all assistants
    return assistants;
  }

  /**
   * Creates a new chat (Thread) for a user
   * @param userId - The ID of the user
   * @param assistantId - The ID of the assistant
   * @param profileId - The ID of the profile
   */
  async createChat(userId: string, assistantId: string, profileId: string) {
    return prisma.thread.create({
      data: {
        userId,
        assistantId,
        profileId,
      },
    });
  }

  /**
   * Lists all chats (Threads) for a user
   * @param userId - The ID of the user
   */
  async listChatsByUserId(userId: string) {
    return prisma.thread.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
} 