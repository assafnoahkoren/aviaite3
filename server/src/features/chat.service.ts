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
	const thread = await this.openai.beta.threads.create();

    return prisma.thread.create({
      data: {
        userId,
        assistantId,
        profileId,
		openaiThreadId: thread.id,
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

  async getChatMessages(threadId: string) {
    // Fetch the thread to get the openaiThreadId
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });
    if (!thread) {
      throw new Error('Thread not found');
    }
    const openaiThreadId = thread.openaiThreadId;

    // Fetch messages from OpenAI
    const messages = await this.openai.beta.threads.messages.list(openaiThreadId);
    // Map OpenAI messages to the expected format
    return messages.data.reverse().map((msg: any) => {
      let text = null;
      if (Array.isArray(msg.content)) {
        const textBlock = msg.content.find((block: any) => block.type === 'text');
        text = textBlock && 'text' in textBlock ? textBlock.text.value : null;
      }
      return {
        id: msg.id,
        threadId,
        userId: msg.role === 'user' ? (msg.user_id || 'user') : 'assistant',
        content: text,
        createdAt: msg.created_at ? new Date(msg.created_at * 1000).toISOString() : new Date().toISOString(),
        role: msg.role,
      };
    });
  }

  /**
   * Creates a message in a thread for a user
   * @param threadId - The ID of the thread
   * @param userId - The ID of the user
   * @param content - The content of the message
   */
  async createMessage(threadId: string, userId: string, content: string) {
    // Find the thread in the database to get the assistantId and openaiThreadId
    const thread = await prisma.thread.findFirst({
      where: { openaiThreadId: threadId },
    });
    if (!thread) {
      throw new Error('Thread not found');
    }
    const assistantId = thread.assistantId;
    const openaiThreadId = thread.openaiThreadId;

    // Create the user message in the OpenAI thread
    const message = await this.openai.beta.threads.messages.create(
      openaiThreadId,
      {
        role: 'user',
        content,
      }
    );

    // Run the assistant and poll for completion
    let run = await this.openai.beta.threads.runs.createAndPoll(
      openaiThreadId,
      {
        assistant_id: assistantId,
        instructions: 'Please address the user as Jane Doe. The user has a premium account.'
      }
    );

    if (run.status === 'completed') {
      const messages = await this.openai.beta.threads.messages.list(
        run.thread_id
      );
      // Find the latest assistant message
      const assistantMessage = messages.data.reverse().find(m => m.role === 'assistant');
      let assistantResponse = null;
      if (assistantMessage && Array.isArray(assistantMessage.content)) {
        const textBlock = assistantMessage.content.find(
          (block: any) => block.type === 'text'
        );
        assistantResponse = textBlock && 'text' in textBlock ? textBlock.text.value : null;
      }
      return {
        id: message.id,
        threadId,
        userId,
        content,
        createdAt: message.created_at ? new Date(message.created_at * 1000).toISOString() : new Date().toISOString(),
        assistantResponse,
      };
    } else {
      return {
        id: message.id,
        threadId,
        userId,
        content,
        createdAt: message.created_at ? new Date(message.created_at * 1000).toISOString() : new Date().toISOString(),
        assistantResponse: null,
        runStatus: run.status,
      };
    }
  }
} 