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

export interface DailyUniqueUsersParams {
  organizationId?: string;
  startDate: string;
  endDate: string;
}

// API functions
export async function getDailyUniqueUsers(params: DailyUniqueUsersParams): Promise<DailyUniqueUsersRangeResult> {
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

// React Query hooks
export function useQ_getDailyUniqueUsers(params: DailyUniqueUsersParams) {
  return useQuery({
    queryKey: ['organization-statistics', 'daily-unique-users', params],
    queryFn: () => getDailyUniqueUsers(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}