import { Injectable } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { 
  DailyUniqueUsersResult, 
  DailyUniqueUsersRangeResult,
  DailyQuestionsRangeResult,
  DailyQuestionsResult,
  UserQuestionCount,
  WeeklyUsageTrendResult,
  UsageTrendDataPoint,
  AverageQuestionsResult,
  WeeklyQuestionsByCategoryResult,
  WeeklyCategoryData,
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
          } : undefined,
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

  async getWeeklyUsageTrend(
    organizationId: string | undefined,
    startDate: Date,
  ): Promise<WeeklyUsageTrendResult> {
    // Calculate date ranges
    const weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // Previous week for comparison
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
    prevWeekEnd.setHours(23, 59, 59, 999);

    // Initialize data points for current week
    const dataPoints: UsageTrendDataPoint[] = [];
    const currentDate = new Date(weekStart);
    
    while (currentDate <= weekEnd) {
      dataPoints.push({
        date: new Date(currentDate),
        messageCount: 0,
        userCount: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get current week messages
    const currentWeekMessages = await prisma.message.findMany({
      where: {
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
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

    // Get previous week message count for trend
    const prevWeekCount = await prisma.message.count({
      where: {
        createdAt: {
          gte: prevWeekStart,
          lte: prevWeekEnd,
        },
        role: 'user',
        Thread: {
          User: organizationId ? {
            organizationId: organizationId,
          } : undefined,
        },
      },
    });

    // Process current week data
    const usersByDay = new Map<string, Set<string>>();
    const messagesByDay = new Map<string, number>();
    const allUsers = new Set<string>();

    currentWeekMessages.forEach(message => {
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

    const totalMessages = currentWeekMessages.length;
    const trendPercentage = prevWeekCount > 0 
      ? Math.round(((totalMessages - prevWeekCount) / prevWeekCount) * 100)
      : 0;

    return {
      startDate: weekStart,
      endDate: weekEnd,
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
          } : undefined,
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

  async getWeeklyQuestionsByCategory(
    organizationId: string | undefined,
    startDate: Date,
  ): Promise<WeeklyQuestionsByCategoryResult> {
    // Calculate 4 weeks date range
    const weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);
    
    const fourWeeksEnd = new Date(weekStart);
    fourWeeksEnd.setDate(fourWeeksEnd.getDate() + 27); // 4 weeks - 1 day
    fourWeeksEnd.setHours(23, 59, 59, 999);

    // Initialize data for 4 weeks
    const weeklyData: WeeklyCategoryData[] = [];
    for (let week = 0; week < 4; week++) {
      const currentWeekStart = new Date(weekStart);
      currentWeekStart.setDate(currentWeekStart.getDate() + (week * 7));
      
      weeklyData.push({
        week: new Date(currentWeekStart),
        categories: [],
        totalQuestions: 0,
      });
    }

    // Get all messages within the 4-week period
    const messages = await prisma.message.findMany({
      where: {
        createdAt: {
          gte: weekStart,
          lte: fourWeeksEnd,
        },
        role: 'user',
        category: {
          not: null,
        },
        Thread: {
          User: organizationId ? {
            organizationId: organizationId,
          } : undefined,
        },
      },
      select: {
        createdAt: true,
        category: true,
      },
    });

    // Group messages by week and category
    const weekCategoryMap = new Map<number, Map<MessageCategory, number>>();
    
    messages.forEach(message => {
      const weekNumber = Math.floor(
        (message.createdAt.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      
      if (weekNumber >= 0 && weekNumber < 4 && message.category) {
        if (!weekCategoryMap.has(weekNumber)) {
          weekCategoryMap.set(weekNumber, new Map());
        }
        
        const categoryMap = weekCategoryMap.get(weekNumber)!;
        categoryMap.set(
          message.category,
          (categoryMap.get(message.category) || 0) + 1
        );
      }
    });

    // Fill in the data for each week
    weekCategoryMap.forEach((categoryMap, weekNumber) => {
      const totalQuestions = Array.from(categoryMap.values()).reduce((sum, count) => sum + count, 0);
      
      const categories: CategoryQuestionCount[] = Array.from(categoryMap.entries())
        .map(([category, count]) => ({
          category: category,
          count: count,
          percentage: totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
      
      weeklyData[weekNumber].categories = categories;
      weeklyData[weekNumber].totalQuestions = totalQuestions;
    });

    // Calculate trends (comparing last week to previous week)
    const categoryTrends: any[] = [];
    
    // Get unique categories across all weeks
    const allCategories = new Set<MessageCategory>();
    weekCategoryMap.forEach(categoryMap => {
      categoryMap.forEach((_, category) => allCategories.add(category));
    });

    // Calculate trend for each category
    allCategories.forEach(category => {
      const previousWeekCount = weekCategoryMap.get(2)?.get(category) || 0;
      const currentWeekCount = weekCategoryMap.get(3)?.get(category) || 0;
      
      const trendPercentage = previousWeekCount > 0
        ? Math.round(((currentWeekCount - previousWeekCount) / previousWeekCount) * 100)
        : currentWeekCount > 0 ? 100 : 0;

      categoryTrends.push({
        category: category,
        trendPercentage,
        previousWeekCount,
        currentWeekCount,
      });
    });

    // Sort trends by current week count
    categoryTrends.sort((a, b) => b.currentWeekCount - a.currentWeekCount);

    return {
      startDate: weekStart,
      endDate: fourWeeksEnd,
      data: weeklyData,
      categoryTrends,
    };
  }
}