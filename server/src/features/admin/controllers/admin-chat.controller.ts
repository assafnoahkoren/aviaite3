import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@features/users/auth.guard';
import { RolesGuard } from '@features/users/guards/roles.guard';
import { Roles } from '@features/users/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma';
import { prisma } from '@services/prisma';

@Controller('api/admin/chat')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminChatController {
  /**
   * Get all messages for a specific thread (admin only)
   * @param threadId - The ID of the thread
   */
  @Get('thread/:threadId/messages')
  async getThreadMessages(@Param('threadId') threadId: string) {
    // First check if the thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Fetch all messages for this thread
    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        threadId: true,
        role: true,
        content: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return thread info with messages
    return {
      thread: {
        id: thread.id,
        name: thread.name,
        assistantId: thread.assistantId,
        userId: thread.userId,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
      },
      messages,
      messageCount: messages.length,
    };
  }

  /**
   * Get thread details with message count (admin only)
   * @param threadId - The ID of the thread
   */
  @Get('thread/:threadId')
  async getThreadDetails(@Param('threadId') threadId: string) {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        _count: {
          select: { Messages: true },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    return thread;
  }
}