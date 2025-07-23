// chat.service.ts
// Service for handling chat logic

import { Injectable, ForbiddenException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ENV } from '../../services/env';
import { prisma } from '../../services/prisma';
import { TokenType, MessageRole, Thread, User, Prisma, MessageCategory, Role } from '../../../generated/prisma';
import { SubscriptionsService } from '../products/subscriptions.service';
import { MessagesService } from './messages.service';
import { ValidationResponseDto } from '../products/dto/validate-access.dto';
import { AssistantStream } from 'openai/lib/AssistantStream';
import {
  ChatsFilter,
  ChatsOrderBy,
  GetChatsByFilterOptions,
  PaginatedResponse,
} from './chat.types';

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

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly messagesService: MessagesService,
  ) {
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
    // Create usage records without storing costs (will be calculated dynamically)
    const usageData = [
      {
        userId,
        organizationId,
        productId: null,
        subscriptionId,
        modelUsed,
        tokenType: TokenType.input,
        tokensUsed: inputTokens,
        costInCents: 0, // Will be calculated dynamically when queried
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
        costInCents: 0, // Will be calculated dynamically when queried
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

  /**
   * Gets chats by filter with pagination and ordering
   * @param options - Filter, ordering, and pagination options
   * @returns Paginated response with threads (without messages)
   */
  async getChatsByFilter(
    options: GetChatsByFilterOptions,
  ): Promise<PaginatedResponse<Thread>> {
    const { filter, orderBy, pagination } = options;
    
    // Build where clause
    const where: Prisma.ThreadWhereInput = {
      deletedAt: null,
      User: {
        role: {
          not: Role.ADMIN,
        },
      },
    };

    if (filter) {
      if (filter.userIds && filter.userIds.length > 0) {
        where.userId = { in: filter.userIds };
      }
      
      if (filter.fromCreatedAt || filter.toCreatedAt) {
        where.createdAt = {};
        if (filter.fromCreatedAt) {
          where.createdAt.gte = filter.fromCreatedAt;
        }
        if (filter.toCreatedAt) {
          where.createdAt.lte = filter.toCreatedAt;
        }
      }
    }

    // Build orderBy clause
    let orderByClause: Prisma.ThreadOrderByWithRelationInput = {};
    
    if (orderBy) {
      switch (orderBy) {
        case ChatsOrderBy.CREATED_AT_ASC:
          orderByClause = { createdAt: 'asc' };
          break;
        case ChatsOrderBy.CREATED_AT_DESC:
          orderByClause = { createdAt: 'desc' };
          break;
        case ChatsOrderBy.MESSAGE_COUNT_ASC:
        case ChatsOrderBy.MESSAGE_COUNT_DESC:
          // For message count ordering, we'll need to include message count
          orderByClause = {
            Messages: {
              _count: orderBy === ChatsOrderBy.MESSAGE_COUNT_ASC ? 'asc' : 'desc',
            },
          };
          break;
        default:
          orderByClause = { createdAt: 'desc' };
      }
    } else {
      orderByClause = { createdAt: 'desc' };
    }

    // Set pagination defaults
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        orderBy: orderByClause,
        skip,
        take: limit,
        include: {
          _count: {
            select: { Messages: true },
          },
          User: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.thread.count({ where }),
    ]);

    return {
      data: threads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

    // Save the message to our database (category will be added later)
    const userMessage = await this.messagesService.addMessage({
      threadId: thread.id,
      role: MessageRole.user,
      content,
    });

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

    // Variable to accumulate the assistant's response
    let assistantResponse = '';

    // Capture text deltas to build the complete response
    stream.on('textDelta', (delta) => {
      if (delta.value) {
        assistantResponse += delta.value;
      }
    });

    // Track token usage and save assistant message when the run completes
    stream.on('end', () => {
      void this.handleStreamCompletion(
        stream,
        thread,
        userId,
        assistantResponse,
        validation,
      );
    });

    return stream;
  }

  /**
   * Categorizes a message using GPT-3.5-turbo
   * @private
   */
  private async categorizeMessage(content: string): Promise<MessageCategory> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a message categorizer for aviation-related content. Categorize the following message into EXACTLY ONE of these categories:
- WARNINGS_ALERTS: Messages about warnings, cautions, alerts, or safety-critical information
- LIMITATIONS: Messages about aircraft limitations, operational limits, or restrictions
- SYSTEM_OPERATIONS: Messages about aircraft systems operations, functionality, or technical details
- FLIGHT_CONTROLS: Messages about flight control systems, control surfaces, or manual flying
- AUTOPILOT_FMC: Messages about autopilot, FMC, navigation, or automated flight systems
- PROCEDURES: Messages about standard procedures, checklists, or operational procedures
- OTHER: Messages that don't fit clearly into the above categories

Respond with ONLY the category name, nothing else.`
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.1,
        max_tokens: 20,
      });

      const categoryString = completion.choices[0]?.message?.content?.trim();
      
      // Map the response to the enum value
      if (categoryString && Object.values(MessageCategory).includes(categoryString as MessageCategory)) {
        return categoryString as MessageCategory;
      }
      
      // Default to OTHER if we can't determine the category
      return MessageCategory.OTHER;
    } catch (error) {
      console.error('Error categorizing message:', error);
      return MessageCategory.OTHER;
    }
  }

  /**
   * Handles stream completion - saves assistant message and tracks token usage
   * @private
   */
  private async handleStreamCompletion(
    stream: AssistantStream,
    thread: Thread & { User: { id: string; organizationId: string | null } },
    userId: string,
    assistantResponse: string,
    validation: ValidationResponseDto,
  ) {
    try {
      // Save the assistant's complete response to our database
      if (assistantResponse) {
        // Categorize the assistant's response
        const category = await this.categorizeMessage(assistantResponse);
        
        // Save the assistant's response with category
        await this.messagesService.addMessage({
          threadId: thread.id,
          role: MessageRole.assistant,
          content: assistantResponse,
          category,
        });
        
        // Update the user's last question with the same category
        const lastUserMessages = await this.messagesService.getMessagesByThreadAndRole(
          thread.id,
          MessageRole.user
        );
        const lastUserMessage = lastUserMessages[lastUserMessages.length - 1];
        
        if (lastUserMessage && !lastUserMessage.category) {
          await this.messagesService.updateMessageCategory(lastUserMessage.id, category);
        }
      }

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
