import { api } from '../../api';
import { useQuery } from '@tanstack/react-query';

// Types
export interface DailyUniqueUsersResult {
  date: string; // ISO date string from API
  uniqueUsers: number;
}

export interface DailyUniqueUsersRangeResult {
  startDate: string; // ISO date string from API
  endDate: string; // ISO date string from API
  data: DailyUniqueUsersResult[];
}

export interface UserQuestionCount {
  userId: string;
  userName: string;
  email: string;
  questionCount: number;
}

export interface DailyQuestionsResult {
  date: string;
  users: UserQuestionCount[];
  totalQuestions: number;
  averagePerUser: number;
}

export interface DailyQuestionsRangeResult {
  startDate: string;
  endDate: string;
  data: DailyQuestionsResult[];
}

export interface UsageTrendDataPoint {
  date: string;
  messageCount: number;
  userCount: number;
}

export interface WeeklyUsageTrendResult {
  startDate: string;
  endDate: string;
  dataPoints: UsageTrendDataPoint[];
  trendPercentage: number;
  totalMessages: number;
  totalUniqueUsers: number;
}

export interface AverageQuestionsResult {
  startDate: string;
  endDate: string;
  totalQuestions: number;
  totalUsers: number;
  totalDays: number;
  averageQuestionsPerUserPerDay: number;
  averageQuestionsPerUser: number;
  averageQuestionsPerDay: number;
}

export interface WeeklyStatisticsParams {
  organizationId?: string;
  startDate: string;
}

export interface CategoryQuestionCount {
  category: string;
  count: number;
  percentage: number;
}

export interface WeeklyCategoryData {
  week: string;
  categories: CategoryQuestionCount[];
  totalQuestions: number;
}

export interface WeeklyQuestionsByCategoryResult {
  startDate: string;
  endDate: string;
  data: WeeklyCategoryData[];
  categoryTrends: {
    category: string;
    trendPercentage: number;
    previousWeekCount: number;
    currentWeekCount: number;
  }[];
}

export interface StatisticsParams {
  organizationId?: string;
  startDate: string;
  endDate: string;
}

// API functions
export async function getDailyUniqueUsers(params: StatisticsParams): Promise<DailyUniqueUsersRangeResult> {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  if (params.organizationId) {
    queryParams.append('organizationId', params.organizationId);
  }

  const res = await api.get<DailyUniqueUsersRangeResult>(
    `/organization-statistics/daily-unique-users?${queryParams.toString()}`
  );
  return res.data;
}

export async function getDailyQuestionsPerUser(params: StatisticsParams): Promise<DailyQuestionsRangeResult> {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  if (params.organizationId) {
    queryParams.append('organizationId', params.organizationId);
  }

  const res = await api.get<DailyQuestionsRangeResult>(
    `/organization-statistics/daily-questions-per-user?${queryParams.toString()}`
  );
  return res.data;
}

export async function getWeeklyUsageTrend(params: WeeklyStatisticsParams): Promise<WeeklyUsageTrendResult> {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
  });

  if (params.organizationId) {
    queryParams.append('organizationId', params.organizationId);
  }

  const res = await api.get<WeeklyUsageTrendResult>(
    `/organization-statistics/weekly-usage-trend?${queryParams.toString()}`
  );
  return res.data;
}

export async function getAverageQuestionsPerUser(params: StatisticsParams): Promise<AverageQuestionsResult> {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  if (params.organizationId) {
    queryParams.append('organizationId', params.organizationId);
  }

  const res = await api.get<AverageQuestionsResult>(
    `/organization-statistics/average-questions-per-user?${queryParams.toString()}`
  );
  return res.data;
}

export async function getWeeklyQuestionsByCategory(params: WeeklyStatisticsParams): Promise<WeeklyQuestionsByCategoryResult> {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
  });

  if (params.organizationId) {
    queryParams.append('organizationId', params.organizationId);
  }

  const res = await api.get<WeeklyQuestionsByCategoryResult>(
    `/organization-statistics/weekly-questions-by-category?${queryParams.toString()}`
  );
  return res.data;
}

// React Query hooks
export function useQ_getDailyUniqueUsers(params: StatisticsParams) {
  return useQuery({
    queryKey: ['organization-statistics', 'daily-unique-users', params],
    queryFn: () => getDailyUniqueUsers(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useQ_getDailyQuestionsPerUser(params: StatisticsParams) {
  return useQuery({
    queryKey: ['organization-statistics', 'daily-questions-per-user', params],
    queryFn: () => getDailyQuestionsPerUser(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useQ_getWeeklyUsageTrend(params: WeeklyStatisticsParams) {
  return useQuery({
    queryKey: ['organization-statistics', 'weekly-usage-trend', params],
    queryFn: () => getWeeklyUsageTrend(params),
    enabled: !!params.startDate,
  });
}

export function useQ_getAverageQuestionsPerUser(params: StatisticsParams) {
  return useQuery({
    queryKey: ['organization-statistics', 'average-questions-per-user', params],
    queryFn: () => getAverageQuestionsPerUser(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useQ_getWeeklyQuestionsByCategory(params: WeeklyStatisticsParams) {
  return useQuery({
    queryKey: ['organization-statistics', 'weekly-questions-by-category', params],
    queryFn: () => getWeeklyQuestionsByCategory(params),
    enabled: !!params.startDate,
  });
}