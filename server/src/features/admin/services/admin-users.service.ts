import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { PaginationDto, PaginatedResponse } from '../dto/pagination.dto';
import { UpdateUserDto, UserFilterDto } from '../dto/admin-user.dto';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
export class AdminUsersService {
  async getUsers(
    pagination: PaginationDto,
    filters: UserFilterDto,
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(filters.role && { role: filters.role }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.verified !== undefined && { verified: filters.verified }),
      ...(filters.organizationId && { organizationId: filters.organizationId }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          hasAccess: true,
          verified: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
          Organization: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              Threads: true,
              UserTokenUsages: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        hasAccess: true,
        verified: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
        Organization: {
          select: {
            id: true,
            name: true,
          },
        },
        Threads: {
          where: { deletedAt: null },
          orderBy: { updatedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            name: true,
            assistantId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        Subscriptions: {
          where: { deletedAt: null },
          orderBy: { startedAt: 'desc' },
          select: {
            id: true,
            status: true,
            interval: true,
            startedAt: true,
            endsAt: true,
            subscriptionProducts: {
              include: {
                Product: true,
                ProductPrice: true,
              },
            },
          },
        },
        _count: {
          select: {
            Threads: true,
            UserTokenUsages: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(userId: string, updateDto: UpdateUserDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateDto,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        hasAccess: true,
        verified: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [
      totalThreads,
      totalMessages,
      tokenUsageByModel,
      recentActivity,
    ] = await Promise.all([
      prisma.thread.count({
        where: { userId, deletedAt: null },
      }),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM "Thread" t
        WHERE t."userId" = ${userId}
        AND t."deletedAt" IS NULL
      `,
      prisma.userTokenUsage.groupBy({
        by: ['modelUsed'],
        where: { userId, deletedAt: null },
        _sum: {
          tokensUsed: true,
          costInCents: true,
        },
      }),
      prisma.userTokenUsage.findMany({
        where: { userId, deletedAt: null },
        orderBy: { date: 'desc' },
        take: 30,
        select: {
          date: true,
          modelUsed: true,
          tokensUsed: true,
          costInCents: true,
        },
      }),
    ]);

    return {
      userId,
      totalThreads,
      totalMessages: Number(totalMessages[0]?.count || 0),
      tokenUsageByModel: tokenUsageByModel.map(usage => ({
        model: usage.modelUsed,
        totalTokens: usage._sum.tokensUsed || 0,
        totalCostCents: usage._sum.costInCents || 0,
      })),
      recentActivity,
    };
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete user
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return { message: 'User deleted successfully' };
  }
}