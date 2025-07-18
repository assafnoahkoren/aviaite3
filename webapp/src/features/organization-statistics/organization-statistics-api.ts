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

export interface DailyUsageTrendResult {
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


export interface CategoryQuestionCount {
  category: string;
  count: number;
  percentage: number;
}

export interface DailyCategoryData {
  date: string;
  categories: CategoryQuestionCount[];
  totalQuestions: number;
}

export interface DailyQuestionsByCategoryResult {
  startDate: string;
  endDate: string;
  data: DailyCategoryData[];
  categoryTotals: {
    category: string;
    totalCount: number;
    percentage: number;
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

export async function getDailyUsageTrend(params: StatisticsParams): Promise<DailyUsageTrendResult> {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  if (params.organizationId) {
    queryParams.append('organizationId', params.organizationId);
  }

  const res = await api.get<DailyUsageTrendResult>(
    `/organization-statistics/daily-usage-trend?${queryParams.toString()}`
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

export async function getDailyQuestionsByCategory(params: StatisticsParams): Promise<DailyQuestionsByCategoryResult> {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  if (params.organizationId) {
    queryParams.append('organizationId', params.organizationId);
  }

  const res = await api.get<DailyQuestionsByCategoryResult>(
    `/organization-statistics/daily-questions-by-category?${queryParams.toString()}`
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

export function useQ_getDailyUsageTrend(params: StatisticsParams) {
  return useQuery({
    queryKey: ['organization-statistics', 'daily-usage-trend', params],
    queryFn: () => getDailyUsageTrend(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useQ_getAverageQuestionsPerUser(params: StatisticsParams) {
  return useQuery({
    queryKey: ['organization-statistics', 'average-questions-per-user', params],
    queryFn: () => getAverageQuestionsPerUser(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useQ_getDailyQuestionsByCategory(params: StatisticsParams) {
  return useQuery({
    queryKey: ['organization-statistics', 'daily-questions-by-category', params],
    queryFn: () => getDailyQuestionsByCategory(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}