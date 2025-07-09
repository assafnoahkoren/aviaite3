// chat.service.ts
// Service for handling chat logic

import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ENV } from '../../services/env';
import { prisma } from '../../services/prisma';

const assistants = [
  {
    id: 'asst_GiwIP1vySr6XctY9w7NvunLw',
    name: 'Co-Pilot-737-V2',
    label: 'Co-Pilot 737 V2',
    devAssistant: true,
    exampleQuestions: [
      'TAF shows TEMPO 2000 +TSRA — do I need an alternate?',
      'What happens in flight if PACK is off?',
      'מה קורה אם יש כשל במערכת TR1 באוויר?',
      'Can you walk me through how to get the most out of you?',
    ],
  },
  {
    id: 'asst_fZC1wK2LvYo8a93nqMVgGrnf',
    name: '787-NEW',
    label: '787 NEW',
    devAssistant: true,
    exampleQuestions: [
      'When is NADP1 preferable over NADP2 at LLBG?',
      "ENG FAIL after takeoff: What's the correct response?",
      'מה משמעות METAR עם VV001 ו־RVR נמוך?',
      "What's the best way to work with you?",
    ],
  },
  {
    id: 'asst_StHM7qcEs2TkCFvc89KGBETy',
    name: 'elal-737',
    label: 'ACE 737',
    exampleQuestions: [
      'TAF shows TEMPO 2000 +TSRA — do I need an alternate?',
      'What happens in flight if PACK is off?',
      'מה קורה אם יש כשל במערכת TR1 באוויר?',
      'Can you walk me through how to get the most out of you?',
    ],
  },
  {
    id: 'asst_9cw3eNl5AIUH1YAsyDmKgK85',
    name: 'elal-787',
    label: 'ACE 787',
    exampleQuestions: [
      'When is NADP1 preferable over NADP2 at LLBG?',
      "ENG FAIL after takeoff: What's the correct response?",
      ' מה משמעות METAR עם VV001 ו־RVR נמוך?',
      "What's the best way to work with you?",
    ],
  },
];

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
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async softDeleteChat(threadId: string, userId: string) {
    const thread = await prisma.thread.findFirst({
      where: { id: threadId, userId },
    });
    if (!thread) {
      throw new Error('Thread not found or user does not have permission');
    }
    return prisma.thread.delete({
      where: { id: threadId },
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
    const messages =
      await this.openai.beta.threads.messages.list(openaiThreadId);
    // Map OpenAI messages to the expected format
    return messages.data.reverse().map((msg: any) => {
      let text = null;
      if (Array.isArray(msg.content)) {
        const textBlock = msg.content.find(
          (block: any) => block.type === 'text',
        );
        text = textBlock && 'text' in textBlock ? textBlock.text.value : null;
      }
      return {
        id: msg.id,
        threadId,
        userId: msg.role === 'user' ? msg.user_id || 'user' : 'assistant',
        content: text,
        createdAt: msg.created_at
          ? new Date(msg.created_at * 1000).toISOString()
          : new Date().toISOString(),
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
    const openaiThreadId = thread.openaiThreadId;

    // Create the user message in the OpenAI thread
    const message = await this.openai.beta.threads.messages.create(
      openaiThreadId,
      {
        role: 'user',
        content,
        metadata: {
          userId,
          assistantId: thread.assistantId,
        },
      },
    );

    // Return the newly created message without starting a run
    return {
      id: message.id,
      threadId,
      userId,
      content,
      createdAt: message.created_at
        ? new Date(message.created_at * 1000).toISOString()
        : new Date().toISOString(),
      role: 'user',
    };
  }

  /**
   * Creates a stream for a thread.
   * @param threadId - The ID of the thread
   */
  async createStream(threadId: string) {
    const thread = await prisma.thread.findFirst({
      where: { openaiThreadId: threadId },
    });
    if (!thread) {
      throw new Error('Thread not found');
    }
    const assistantId = thread.assistantId;
    const openaiThreadId = thread.openaiThreadId;

    const stream = this.openai.beta.threads.runs.stream(openaiThreadId, {
      assistant_id: assistantId,
    });

    return stream;
  }

  async generateChatName(threadId: string, userId: string) {
    // 1. get the thread from our DB
    const thread = await prisma.thread.findFirst({
      where: { openaiThreadId: threadId, userId },
    });
    if (!thread) {
      throw new Error('Thread not found or user does not have access');
    }

    // 2. get the messages from openai
    const messages = await this.openai.beta.threads.messages.list(
      thread.openaiThreadId,
    );

    const messageContent = messages.data
      .map((msg) => {
        const content = msg.content[0];
        if (content?.type === 'text') {
          return `${msg.role}: ${content.text.value}`;
        }
        return '';
      })
      .filter(Boolean)
      .reverse()
      .join('\n');

    // 3. use openai to generate a name
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Based on the following chat conversation, please provide a short and concise name for the chat, no longer than 5 words. Do not include any quotation marks in the name.',
        },
        {
          role: 'user',
          content: messageContent,
        },
      ],
      max_tokens: 20,
    });

    const chatName = response.choices[0].message.content
      ?.trim()
      .replace(/"/g, '');

    // 4. update the thread in our DB
    await prisma.thread.update({
      where: { id: thread.id },
      data: { name: chatName },
    });

    return { name: chatName };
  }
}
