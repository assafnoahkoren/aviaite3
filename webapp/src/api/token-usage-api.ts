import { api } from './index';
import { useQuery } from '@tanstack/react-query';

// Types
export interface TokenUsageRecord {
  id: string;
  userId: string;
  organizationId: string | null;
  productId: string | null;
  modelUsed: string;
  tokenType: 'input' | 'output';
  tokensUsed: number;
  costInCents: number;
  date: string;
  createdAt: string;
  User?: {
    id: string;
    email: string;
    fullName: string | null;
    Organization?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface TokenUsageSummary {
  model: string;
  tokenType: 'input' | 'output';
  totalTokens: number;
  totalCostCents: number;
}

export interface UserTokenUsage {
  usage: TokenUsageSummary[];
  totalCostCents: number;
}

export interface OrganizationTokenUsage {
  usage: TokenUsageSummary[];
  totalCostCents: number;
  topUsers: {
    userId: string;
    email: string;
    fullName: string | null;
    totalTokens: number;
    totalCostCents: number;
  }[];
}

export interface DailyTokenUsage {
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCostCents: number;
}

export interface ModelUsageBreakdown {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCostCents: number;
  requestCount: number;
  averageTokensPerRequest: number;
}

export interface TokenUsageFilters {
  userId?: string;
  organizationId?: string;
  modelUsed?: string;
  tokenType?: 'input' | 'output';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTokenUsage {
  records: TokenUsageRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Functions

/**
 * Get all token usage records with pagination and filters (Admin only)
 */
export async function getAllTokenUsage(filters: TokenUsageFilters = {}): Promise<PaginatedTokenUsage> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  
  const res = await api.get(`/api/admin/token-usage?${params.toString()}`);
  return res.data;
}

/**
 * Get token usage for a specific user (Admin only)
 */
export async function getUserTokenUsage(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<UserTokenUsage> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await api.get(`/api/admin/token-usage/user/${userId}?${params.toString()}`);
  return res.data;
}

/**
 * Get token usage for a specific organization (Admin only)
 */
export async function getOrganizationTokenUsage(
  organizationId: string,
  startDate?: string,
  endDate?: string
): Promise<OrganizationTokenUsage> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await api.get(`/api/admin/token-usage/organization/${organizationId}?${params.toString()}`);
  return res.data;
}

/**
 * Get daily token usage trends (Admin only)
 */
export async function getDailyTokenUsage(
  days: number = 30,
  organizationId?: string
): Promise<DailyTokenUsage[]> {
  const params = new URLSearchParams();
  params.append('days', String(days));
  if (organizationId) params.append('organizationId', organizationId);
  
  const res = await api.get(`/api/admin/token-usage/daily?${params.toString()}`);
  return res.data;
}

/**
 * Get token usage breakdown by model (Admin only)
 */
export async function getModelUsageBreakdown(
  startDate?: string,
  endDate?: string,
  organizationId?: string
): Promise<ModelUsageBreakdown[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (organizationId) params.append('organizationId', organizationId);
  
  const res = await api.get(`/api/admin/token-usage/models?${params.toString()}`);
  return res.data;
}

/**
 * Get current user's own token usage
 */
export async function getMyTokenUsage(
  startDate?: string,
  endDate?: string
): Promise<UserTokenUsage> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await api.get(`/api/admin/token-usage/my-usage?${params.toString()}`);
  return res.data;
}

// React Query Hooks

export function useQ_getAllTokenUsage(filters: TokenUsageFilters = {}) {
  return useQuery({
    queryKey: ['token-usage', 'all', filters],
    queryFn: () => getAllTokenUsage(filters),
  });
}

export function useQ_getUserTokenUsage(userId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['token-usage', 'user', userId, startDate, endDate],
    queryFn: () => getUserTokenUsage(userId, startDate, endDate),
    enabled: !!userId,
  });
}

export function useQ_getOrganizationTokenUsage(
  organizationId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['token-usage', 'organization', organizationId, startDate, endDate],
    queryFn: () => getOrganizationTokenUsage(organizationId, startDate, endDate),
    enabled: !!organizationId,
  });
}

export function useQ_getDailyTokenUsage(days: number = 30, organizationId?: string) {
  return useQuery({
    queryKey: ['token-usage', 'daily', days, organizationId],
    queryFn: () => getDailyTokenUsage(days, organizationId),
  });
}

export function useQ_getModelUsageBreakdown(
  startDate?: string,
  endDate?: string,
  organizationId?: string
) {
  return useQuery({
    queryKey: ['token-usage', 'models', startDate, endDate, organizationId],
    queryFn: () => getModelUsageBreakdown(startDate, endDate, organizationId),
  });
}

export function useQ_getMyTokenUsage(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['token-usage', 'my-usage', startDate, endDate],
    queryFn: () => getMyTokenUsage(startDate, endDate),
  });
}

// Utility Functions

/**
 * Format cents to dollars with appropriate decimal places
 */
export function formatCost(cents: number): string {
  const dollars = cents / 100;
  
  // For very small values, show more decimal places
  if (dollars < 0.01 && dollars > 0) {
    return `$${dollars.toFixed(6)}`;
  } else if (dollars < 1) {
    return `$${dollars.toFixed(4)}`;
  }
  
  return `$${dollars.toFixed(3)}`;
}

/**
 * Format large numbers with commas
 */
export function formatTokens(tokens: number): string {
  return tokens.toLocaleString();
}