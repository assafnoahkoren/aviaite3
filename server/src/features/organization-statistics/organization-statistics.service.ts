import { Injectable } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { DailyUniqueUsersResult, DailyUniqueUsersRangeResult } from './dto/statistics-response.dto';

@Injectable()
export class OrganizationStatisticsService {
  constructor() {}

  async getDailyUniqueUsers(
    organizationId: string | null,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyUniqueUsersRangeResult> {
    // Normalize dates to start of day
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);
    
    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);

    // Initialize result array with zeros for each day in the range
    const dailyResults: DailyUniqueUsersResult[] = [];
    const currentDate = new Date(normalizedStartDate);
    
    while (currentDate <= normalizedEndDate) {
      dailyResults.push({
        date: new Date(currentDate),
        uniqueUsers: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get all unique users who sent messages in the date range
    const messages = await prisma.message.findMany({
      where: {
        createdAt: {
          gte: normalizedStartDate,
          lte: normalizedEndDate,
        },
        role: 'user',
        Thread: {
          User: organizationId ? {
            organizationId: organizationId,
          } : undefined,
        },
      },
      select: {
        createdAt: true,
        Thread: {
          select: {
            userId: true,
          },
        },
      },
    });

    // Group messages by day and count unique users
    const usersByDay = new Map<string, Set<string>>();
    
    messages.forEach(message => {
      const dateKey = message.createdAt.toISOString().split('T')[0];
      
      if (!usersByDay.has(dateKey)) {
        usersByDay.set(dateKey, new Set());
      }
      
      usersByDay.get(dateKey)!.add(message.Thread.userId);
    });

    // Update the results with actual counts
    dailyResults.forEach(result => {
      const dateKey = result.date.toISOString().split('T')[0];
      const usersSet = usersByDay.get(dateKey);
      
      if (usersSet) {
        result.uniqueUsers = usersSet.size;
      }
    });

    return {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      data: dailyResults,
    };
  }

  async getDailyQuestionsPerUser(
    organizationId: string | null,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // TODO: Implement daily questions per user
    throw new Error('Not implemented');
  }

  async getWeeklyUsageTrend(
    organizationId: string | null,
    startDate: Date,
  ): Promise<any> {
    // TODO: Implement weekly usage trend
    throw new Error('Not implemented');
  }

  async getAverageQuestionsPerUser(
    organizationId: string | null,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // TODO: Implement average questions per user per day
    throw new Error('Not implemented');
  }

  async getWeeklyQuestionsByCategory(
    organizationId: string | null,
    startDate: Date,
  ): Promise<any> {
    // TODO: Implement questions per category per week with trend
    throw new Error('Not implemented');
  }
}