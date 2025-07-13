// chat.service.ts
// Service for handling chat logic

import { Injectable, ForbiddenException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ENV } from '../../services/env';
import { prisma } from '../../services/prisma';
import { TokenType } from '../../../generated/prisma';
import { SubscriptionsService } from '../products/subscriptions.service';

export const assistants = [
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
    label: 'ACE 787 NEW',
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

  constructor(private readonly subscriptionsService: SubscriptionsService) {
    this.openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
  }

  /**
   * Helper method to validate subscription access
   */
  private async validateAccess(userId: string, assistantId: string) {
    const validation = await this.subscriptionsService.validateSubscriptionAccess(
      userId,
      { assistantId }
    );
    
    if (!validation.hasAccess) {
      // Find which assistant was requested
      const assistant = assistants.find(a => a.id === assistantId);
      const assistantName = assistant?.label || 'Unknown Assistant';
      
      // Map assistant to required product
      const requiredProduct = this.subscriptionsService.mapAssistantToProduct(assistantId);
      
      // Create detailed error response
      const errorDetails: any = {
        message: validation.reason || 'Access denied',
        code: 'SUBSCRIPTION_REQUIRED',
        details: {
          assistantId,
          assistantName,
          requiredProduct,
          currentSubscription: validation.subscription,
          usage: validation.usage,
        },
      };
      
      // Add specific guidance based on the reason
      if (validation.reason === 'No active subscription found') {
        errorDetails.details.requiredAction = 'SUBSCRIBE';
        errorDetails.details.suggestedProducts = requiredProduct ? [requiredProduct] : ['ace-737', 'ace-787'];
      } else if (validation.reason?.includes('not included in subscription')) {
        errorDetails.details.requiredAction = 'UPGRADE';
        errorDetails.details.currentProducts = validation.subscription?.products || [];
      } else if (validation.reason === 'Token limit exceeded for current period') {
        errorDetails.details.requiredAction = 'PURCHASE_TOKENS';
        errorDetails.details.resetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
      }
      
      throw new ForbiddenException(errorDetails);
    }
    
    return validation;
  }


  /**
   * Helper method to track token usage
   */
  private async trackTokenUsage(
    userId: string,
    organizationId: string | null,
    modelUsed: string,
    inputTokens: number,
    outputTokens: number,
    subscriptionId?: string,
  ) {
    // Model pricing in cents per 1M tokens
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-3.5-turbo': { input: 50, output: 150 }, // $0.50/$1.50 per 1M tokens
      'gpt-4': { input: 3000, output: 6000 }, // $30/$60 per 1M tokens
      'gpt-4-turbo': { input: 1000, output: 3000 }, // $10/$30 per 1M tokens
      'gpt-4o': { input: 500, output: 1500 }, // $5/$15 per 1M tokens
    };

    const modelPricing = pricing[modelUsed] || pricing['gpt-4'];
    
    // Calculate costs in cents
    const inputCostCents = Math.ceil((inputTokens * modelPricing.input) / 1_000_000);
    const outputCostCents = Math.ceil((outputTokens * modelPricing.output) / 1_000_000);

    // Create usage records
    const usageData = [
      {
        userId,
        organizationId,
        productId: null,
        subscriptionId,
        modelUsed,
        tokenType: TokenType.input,
        tokensUsed: inputTokens,
        costInCents: inputCostCents,
        date: new Date(),
      },
      {
        userId,
        organizationId,
        productId: null,
        subscriptionId,
        modelUsed,
        tokenType: TokenType.output,
        tokensUsed: outputTokens,
        costInCents: outputCostCents,
        date: new Date(),
      },
    ];

    await prisma.userTokenUsage.createMany({
      data: usageData,
    });
  }

  listAllAssistants() {
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
    // Validate subscription access before creating a new chat
    await this.validateAccess(userId, assistantId);
    
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
    
    // Validate subscription access
    await this.validateAccess(userId, thread.assistantId);
    
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
   * @param userId - The ID of the user (for token tracking)
   */
  async createStream(threadId: string, userId: string) {
    const thread = await prisma.thread.findFirst({
      where: { 
        openaiThreadId: threadId,
        userId, // Ensure thread belongs to the user
      },
      include: {
        User: {
          select: {
            id: true,
            organizationId: true,
          },
        },
      },
    });
    if (!thread) {
      throw new Error('Thread not found or access denied');
    }
    
    // Validate subscription access before starting stream
    const validation = await this.validateAccess(userId, thread.assistantId);
    
    const assistantId = thread.assistantId;
    const openaiThreadId = thread.openaiThreadId;

    const stream = this.openai.beta.threads.runs.stream(openaiThreadId, {
      assistant_id: assistantId,
    });

    // Track token usage when the run completes
    stream.on('end', async () => {
      try {
        // Get the final run from the stream
        const run = stream.currentRun();
        
        // Check if usage data is available
        if (run && run.usage) {
          // Assistants API model - check run details
          const modelUsed = run.model || 'gpt-4';
          
          await this.trackTokenUsage(
            userId,
            thread.User.organizationId,
            modelUsed,
            run.usage.prompt_tokens,
            run.usage.completion_tokens,
            validation.subscription?.id,
          );
        }
      } catch (error) {
        console.error('Error tracking token usage for stream:', error);
      }
    });

    return stream;
  }

  async generateChatName(threadId: string, userId: string) {
    // 1. get the thread from our DB with user info
    const thread = await prisma.thread.findFirst({
      where: { openaiThreadId: threadId, userId },
      include: {
        User: {
          select: {
            id: true,
            organizationId: true,
          },
        },
      },
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

    // Track token usage
    if (response.usage) {
      await this.trackTokenUsage(
        userId,
        thread.User.organizationId,
        'gpt-3.5-turbo',
        response.usage.prompt_tokens,
        response.usage.completion_tokens,
      );
    }

    // 4. update the thread in our DB
    await prisma.thread.update({
      where: { id: thread.id },
      data: { name: chatName },
    });

    return { name: chatName };
  }
}
