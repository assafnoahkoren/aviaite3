import { Injectable } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { TokenType } from '../../../generated/prisma';

@Injectable()
export class TokenUsageService {
  /**
   * Get token usage summary for a specific user
   */
  async getUserTokenUsage(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where = {
      userId,
      deletedAt: null,
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [usage, totalCost] = await Promise.all([
      prisma.userTokenUsage.groupBy({
        by: ['modelUsed', 'tokenType'],
        where,
        _sum: {
          tokensUsed: true,
          costInCents: true,
        },
      }),
      prisma.userTokenUsage.aggregate({
        where,
        _sum: {
          costInCents: true,
        },
      }),
    ]);

    return {
      usage: usage.map(item => ({
        model: item.modelUsed,
        tokenType: item.tokenType,
        totalTokens: item._sum.tokensUsed || 0,
        totalCostCents: item._sum.costInCents || 0,
      })),
      totalCostCents: totalCost._sum.costInCents || 0,
    };
  }

  /**
   * Get token usage summary for an organization
   */
  async getOrganizationTokenUsage(
    organizationId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where = {
      organizationId,
      deletedAt: null,
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [usage, totalCost, userBreakdown] = await Promise.all([
      prisma.userTokenUsage.groupBy({
        by: ['modelUsed', 'tokenType'],
        where,
        _sum: {
          tokensUsed: true,
          costInCents: true,
        },
      }),
      prisma.userTokenUsage.aggregate({
        where,
        _sum: {
          costInCents: true,
        },
      }),
      prisma.userTokenUsage.groupBy({
        by: ['userId'],
        where,
        _sum: {
          tokensUsed: true,
          costInCents: true,
        },
        orderBy: {
          _sum: {
            costInCents: 'desc',
          },
        },
        take: 10, // Top 10 users
      }),
    ]);

    // Get user details for the top users
    const userIds = userBreakdown.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, fullName: true },
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    return {
      usage: usage.map(item => ({
        model: item.modelUsed,
        tokenType: item.tokenType,
        totalTokens: item._sum.tokensUsed || 0,
        totalCostCents: item._sum.costInCents || 0,
      })),
      totalCostCents: totalCost._sum.costInCents || 0,
      topUsers: userBreakdown.map(item => ({
        userId: item.userId,
        email: userMap[item.userId]?.email || 'Unknown',
        fullName: userMap[item.userId]?.fullName || null,
        totalTokens: item._sum.tokensUsed || 0,
        totalCostCents: item._sum.costInCents || 0,
      })),
    };
  }

  /**
   * Get daily token usage trends
   */
  async getDailyTokenUsage(
    days: number = 30,
    organizationId?: string,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Use groupBy instead of raw query to avoid BigInt serialization issues
    const usage = await prisma.userTokenUsage.groupBy({
      by: ['date', 'tokenType'],
      where: {
        date: { gte: startDate },
        deletedAt: null,
        ...(organizationId && { organizationId }),
      },
      _sum: {
        tokensUsed: true,
        costInCents: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transform the data for easier consumption
    const dateMap = new Map<string, { input: number; output: number; cost: number }>();
    
    usage.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { input: 0, output: 0, cost: 0 });
      }
      const data = dateMap.get(dateStr)!;
      if (row.tokenType === TokenType.input) {
        data.input = row._sum.tokensUsed || 0;
      } else {
        data.output = row._sum.tokensUsed || 0;
      }
      data.cost += row._sum.costInCents || 0;
    });

    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      inputTokens: data.input,
      outputTokens: data.output,
      totalTokens: data.input + data.output,
      totalCostCents: data.cost,
    }));
  }

  /**
   * Get token usage by model
   */
  async getModelUsageBreakdown(
    startDate?: Date,
    endDate?: Date,
    organizationId?: string,
  ) {
    const where = {
      deletedAt: null,
      ...(organizationId && { organizationId }),
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const modelUsage = await prisma.userTokenUsage.groupBy({
      by: ['modelUsed', 'tokenType'],
      where,
      _sum: {
        tokensUsed: true,
        costInCents: true,
      },
      _count: {
        _all: true,
      },
    });

    // Group by model
    const modelMap = new Map<string, {
      inputTokens: number;
      outputTokens: number;
      totalCost: number;
      requestCount: number;
    }>();

    modelUsage.forEach(item => {
      if (!modelMap.has(item.modelUsed)) {
        modelMap.set(item.modelUsed, {
          inputTokens: 0,
          outputTokens: 0,
          totalCost: 0,
          requestCount: 0,
        });
      }
      const data = modelMap.get(item.modelUsed)!;
      if (item.tokenType === TokenType.input) {
        data.inputTokens = item._sum.tokensUsed || 0;
      } else {
        data.outputTokens = item._sum.tokensUsed || 0;
      }
      data.totalCost += item._sum.costInCents || 0;
      data.requestCount += item._count._all;
    });

    return Array.from(modelMap.entries()).map(([model, data]) => ({
      model,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      totalTokens: data.inputTokens + data.outputTokens,
      totalCostCents: data.totalCost,
      requestCount: Math.floor(data.requestCount / 2), // Divide by 2 since we track input/output separately
      averageTokensPerRequest: Math.round((data.inputTokens + data.outputTokens) / (data.requestCount / 2)),
    }));
  }

  /**
   * Get all token usage records with pagination
   */
  async getAllTokenUsage(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: string;
      organizationId?: string;
      modelUsed?: string;
      tokenType?: TokenType;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.organizationId && { organizationId: filters.organizationId }),
      ...(filters?.modelUsed && { modelUsed: filters.modelUsed }),
      ...(filters?.tokenType && { tokenType: filters.tokenType }),
      ...(filters?.startDate && filters?.endDate && {
        date: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      }),
    };

    const [records, total] = await Promise.all([
      prisma.userTokenUsage.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              email: true,
              fullName: true,
              Organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userTokenUsage.count({ where }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}