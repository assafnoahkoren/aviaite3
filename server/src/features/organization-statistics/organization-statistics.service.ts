import { Injectable } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { 
  DailyUniqueUsersResult, 
  DailyUniqueUsersRangeResult,
  DailyQuestionsRangeResult,
  DailyQuestionsResult,
  UserQuestionCount,
  DailyUsageTrendResult,
  UsageTrendDataPoint,
  AverageQuestionsResult,
  DailyQuestionsByCategoryResult,
  DailyCategoryData,
  CategoryQuestionCount
} from './dto/statistics-response.dto';
import { MessageCategory } from '../../../generated/prisma';

@Injectable()
export class OrganizationStatisticsService {
  constructor() {}

  async getDailyUniqueUsers(
    organizationId: string | undefined,
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
            role: { not: 'ADMIN' },
          } : {
            role: { not: 'ADMIN' },
          },
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
    organizationId: string | undefined,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyQuestionsRangeResult> {
    // Normalize dates
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);
    
    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);

    // Initialize result array with zeros for each day
    const dailyResults: DailyQuestionsResult[] = [];
    const currentDate = new Date(normalizedStartDate);
    
    while (currentDate <= normalizedEndDate) {
      dailyResults.push({
        date: new Date(currentDate),
        users: [],
        totalQuestions: 0,
        averagePerUser: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get all user messages in date range with user info
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
            role: { not: 'ADMIN' },
          } : {
            role: { not: 'ADMIN' },
          },
        },
      },
      select: {
        createdAt: true,
        Thread: {
          select: {
            User: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Group by day and user
    const messagesByDayAndUser = new Map<string, Map<string, { user: any; count: number }>>();
    
    messages.forEach(message => {
      const dateKey = message.createdAt.toISOString().split('T')[0];
      const userId = message.Thread.User.id;
      
      if (!messagesByDayAndUser.has(dateKey)) {
        messagesByDayAndUser.set(dateKey, new Map());
      }
      
      const dayMap = messagesByDayAndUser.get(dateKey)!;
      
      if (!dayMap.has(userId)) {
        dayMap.set(userId, {
          user: message.Thread.User,
          count: 0,
        });
      }
      
      dayMap.get(userId)!.count++;
    });

    // Update results with actual data
    dailyResults.forEach(result => {
      const dateKey = result.date.toISOString().split('T')[0];
      const dayData = messagesByDayAndUser.get(dateKey);
      
      if (dayData) {
        const users: UserQuestionCount[] = Array.from(dayData.values()).map(({ user, count }) => ({
          userId: user.id,
          userName: user.fullName || user.email,
          email: user.email,
          questionCount: count,
        }));
        
        const totalQuestions = users.reduce((sum, user) => sum + user.questionCount, 0);
        
        result.users = users.sort((a, b) => b.questionCount - a.questionCount);
        result.totalQuestions = totalQuestions;
        result.averagePerUser = users.length > 0 ? Math.round(totalQuestions / users.length) : 0;
      }
    });

    return {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      data: dailyResults,
    };
  }

  async getDailyUsageTrend(
    organizationId: string | undefined,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyUsageTrendResult> {
    // Normalize dates
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);
    
    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);
    
    // Calculate previous period for comparison
    const periodLength = Math.ceil((normalizedEndDate.getTime() - normalizedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const prevPeriodStart = new Date(normalizedStartDate);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - periodLength);
    
    const prevPeriodEnd = new Date(prevPeriodStart);
    prevPeriodEnd.setDate(prevPeriodEnd.getDate() + periodLength - 1);
    prevPeriodEnd.setHours(23, 59, 59, 999);

    // Initialize data points for date range
    const dataPoints: UsageTrendDataPoint[] = [];
    const currentDate = new Date(normalizedStartDate);
    
    while (currentDate <= normalizedEndDate) {
      dataPoints.push({
        date: new Date(currentDate),
        messageCount: 0,
        userCount: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get messages for current period
    const currentPeriodMessages = await prisma.message.findMany({
      where: {
        createdAt: {
          gte: normalizedStartDate,
          lte: normalizedEndDate,
        },
        role: 'user',
        Thread: {
          User: organizationId ? {
            organizationId: organizationId,
            role: { not: 'ADMIN' },
          } : {
            role: { not: 'ADMIN' },
          },
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

    // Get previous period message count for trend
    const prevPeriodCount = await prisma.message.count({
      where: {
        createdAt: {
          gte: prevPeriodStart,
          lte: prevPeriodEnd,
        },
        role: 'user',
        Thread: {
          User: organizationId ? {
            organizationId: organizationId,
            role: { not: 'ADMIN' },
          } : {
            role: { not: 'ADMIN' },
          },
        },
      },
    });

    // Process current period data
    const usersByDay = new Map<string, Set<string>>();
    const messagesByDay = new Map<string, number>();
    const allUsers = new Set<string>();

    currentPeriodMessages.forEach(message => {
      const dateKey = message.createdAt.toISOString().split('T')[0];
      const userId = message.Thread.userId;
      
      allUsers.add(userId);
      
      if (!usersByDay.has(dateKey)) {
        usersByDay.set(dateKey, new Set());
        messagesByDay.set(dateKey, 0);
      }
      
      usersByDay.get(dateKey)!.add(userId);
      messagesByDay.set(dateKey, (messagesByDay.get(dateKey) || 0) + 1);
    });

    // Update data points with actual data
    dataPoints.forEach(point => {
      const dateKey = point.date.toISOString().split('T')[0];
      point.messageCount = messagesByDay.get(dateKey) || 0;
      point.userCount = usersByDay.get(dateKey)?.size || 0;
    });

    const totalMessages = currentPeriodMessages.length;
    const trendPercentage = prevPeriodCount > 0 
      ? Math.round(((totalMessages - prevPeriodCount) / prevPeriodCount) * 100)
      : 0;

    return {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      dataPoints,
      trendPercentage,
      totalMessages,
      totalUniqueUsers: allUsers.size,
    };
  }

  async getAverageQuestionsPerUser(
    organizationId: string | undefined,
    startDate: Date,
    endDate: Date,
  ): Promise<AverageQuestionsResult> {
    // Normalize dates
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);
    
    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);

    // Calculate total days
    const totalDays = Math.ceil((normalizedEndDate.getTime() - normalizedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Get all messages and unique users
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
            role: { not: 'ADMIN' },
          } : {
            role: { not: 'ADMIN' },
          },
        },
      },
      select: {
        Thread: {
          select: {
            userId: true,
          },
        },
      },
    });

    const uniqueUsers = new Set(messages.map(m => m.Thread.userId));
    const totalQuestions = messages.length;
    const totalUsers = uniqueUsers.size;

    return {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      totalQuestions,
      totalUsers,
      totalDays,
      averageQuestionsPerUserPerDay: totalUsers > 0 && totalDays > 0 
        ? Number((totalQuestions / totalUsers / totalDays).toFixed(2))
        : 0,
      averageQuestionsPerUser: totalUsers > 0 
        ? Number((totalQuestions / totalUsers).toFixed(2))
        : 0,
      averageQuestionsPerDay: totalDays > 0 
        ? Number((totalQuestions / totalDays).toFixed(2))
        : 0,
    };
  }

  async getDailyQuestionsByCategory(
    organizationId: string | undefined,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyQuestionsByCategoryResult> {
    // Normalize dates
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);
    
    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(23, 59, 59, 999);

    // Initialize data for each day
    const dailyData: DailyCategoryData[] = [];
    const currentDate = new Date(normalizedStartDate);
    
    while (currentDate <= normalizedEndDate) {
      dailyData.push({
        date: new Date(currentDate),
        categories: [],
        totalQuestions: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get all messages within the date range
    const messages = await prisma.message.findMany({
      where: {
        createdAt: {
          gte: normalizedStartDate,
          lte: normalizedEndDate,
        },
        role: 'user',
        category: {
          not: null,
        },
        Thread: {
          User: organizationId ? {
            organizationId: organizationId,
            role: { not: 'ADMIN' },
          } : {
            role: { not: 'ADMIN' },
          },
        },
      },
      select: {
        createdAt: true,
        category: true,
      },
    });

    // Group messages by day and category
    const dayCategoryMap = new Map<string, Map<MessageCategory, number>>();
    const overallCategoryTotals = new Map<MessageCategory, number>();
    
    messages.forEach(message => {
      const dateKey = message.createdAt.toISOString().split('T')[0];
      
      if (message.category) {
        // Update daily counts
        if (!dayCategoryMap.has(dateKey)) {
          dayCategoryMap.set(dateKey, new Map());
        }
        
        const categoryMap = dayCategoryMap.get(dateKey)!;
        categoryMap.set(
          message.category,
          (categoryMap.get(message.category) || 0) + 1
        );
        
        // Update overall totals
        overallCategoryTotals.set(
          message.category,
          (overallCategoryTotals.get(message.category) || 0) + 1
        );
      }
    });

    // Fill in the data for each day
    dailyData.forEach(dayData => {
      const dateKey = dayData.date.toISOString().split('T')[0];
      const categoryMap = dayCategoryMap.get(dateKey);
      
      if (categoryMap) {
        const totalQuestions = Array.from(categoryMap.values()).reduce((sum, count) => sum + count, 0);
        
        const categories: CategoryQuestionCount[] = Array.from(categoryMap.entries())
          .map(([category, count]) => ({
            category: category,
            count: count,
            percentage: totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0,
          }))
          .sort((a, b) => b.count - a.count);
        
        dayData.categories = categories;
        dayData.totalQuestions = totalQuestions;
      }
    });

    // Calculate overall category totals
    const totalQuestions = messages.length;
    const categoryTotals = Array.from(overallCategoryTotals.entries())
      .map(([category, count]) => ({
        category: category,
        totalCount: count,
        percentage: totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0,
      }))
      .sort((a, b) => b.totalCount - a.totalCount);

    return {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      data: dailyData,
      categoryTotals,
    };
  }
}