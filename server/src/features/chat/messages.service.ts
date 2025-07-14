import { Injectable } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { MessageRole } from '../../../generated/prisma';

@Injectable()
export class MessagesService {
  async addMessage(params: {
    threadId: string;
    role: MessageRole;
    content: string;
  }) {
    const { threadId, role, content } = params;

    // Verify thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      throw new Error(`Thread with id ${threadId} not found`);
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        threadId,
        role,
        content,
      },
    });

    return message;
  }

  async getThreadMessages(threadId: string) {
    const messages = await prisma.message.findMany({
      where: {
        threadId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  }

  async deleteMessage(messageId: string) {
    // Soft delete
    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        deletedAt: new Date(),
      },
    });

    return message;
  }

  async getMessagesByThreadAndRole(threadId: string, role: MessageRole) {
    const messages = await prisma.message.findMany({
      where: {
        threadId,
        role,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  }
}