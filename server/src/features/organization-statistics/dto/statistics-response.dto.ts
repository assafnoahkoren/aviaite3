export interface DailyUniqueUsersResult {
  date: Date;
  uniqueUsers: number;
}

export interface DailyUniqueUsersRangeResult {
  startDate: Date;
  endDate: Date;
  data: DailyUniqueUsersResult[];
}

export interface UserQuestionCount {
  userId: string;
  userName: string;
  email: string;
  questionCount: number;
}

export interface DailyQuestionsResult {
  date: Date;
  users: UserQuestionCount[];
  totalQuestions: number;
  averagePerUser: number;
}

export interface DailyQuestionsRangeResult {
  startDate: Date;
  endDate: Date;
  data: DailyQuestionsResult[];
}

export interface UsageTrendDataPoint {
  date: Date;
  messageCount: number;
  userCount: number;
}

export interface WeeklyUsageTrendResult {
  startDate: Date;
  endDate: Date;
  dataPoints: UsageTrendDataPoint[];
  trendPercentage: number; // compared to previous week
  totalMessages: number;
  totalUniqueUsers: number;
}

export interface AverageQuestionsResult {
  startDate: Date;
  endDate: Date;
  totalQuestions: number;
  totalUsers: number;
  totalDays: number;
  averageQuestionsPerUserPerDay: number;
  averageQuestionsPerUser: number;
  averageQuestionsPerDay: number;
}

export interface CategoryQuestionCount {
  category: string;
  count: number;
  percentage: number;
}

export interface WeeklyCategoryData {
  week: Date;
  categories: CategoryQuestionCount[];
  totalQuestions: number;
}

export interface WeeklyQuestionsByCategoryResult {
  startDate: Date;
  endDate: Date;
  data: WeeklyCategoryData[];
  categoryTrends: {
    category: string;
    trendPercentage: number;
    previousWeekCount: number;
    currentWeekCount: number;
  }[];
}