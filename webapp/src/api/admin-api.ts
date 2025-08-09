import { api } from './index';
import type { UserRole } from './models';

// Common types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User Management
export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
  hasAccess: boolean;
  verified: boolean;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
  Organization?: {
    id: string;
    name: string;
  };
  _count?: {
    Threads: number;
    UserTokenUsages: number;
  };
}

export interface UserStats {
  userId: string;
  totalThreads: number;
  totalMessages: number;
  tokenUsageByModel: Array<{
    model: string;
    totalTokens: number;
    totalCostCents: number;
  }>;
  recentActivity: Array<{
    date: string;
    modelUsed: string;
    tokensUsed: number;
    costInCents: number;
  }>;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  hasAccess?: boolean;
  verified?: boolean;
  organizationId?: string | null;
}

// Organization Management
export interface AdminOrganization {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    Users: number;
  };
}

export interface OrganizationStats {
  organizationId: string;
  organizationName: string;
  totalUsers: number;
  activeUsers: number;
  totalThreads: number;
  tokenUsageByModel: Array<{
    model: string;
    totalTokens: number;
    totalCostCents: number;
  }>;
}

// Product Management
export interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  prices: ProductPrice[];
  _count?: {
    SubscriptionProducts: number;
    UserTokenUsages: number;
  };
}

export interface ProductPrice {
  id: string;
  productId: string;
  interval: 'monthly' | 'yearly';
  priceCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  prices: Array<{
    interval: 'monthly' | 'yearly';
    priceCents: number;
    currency?: string;
  }>;
}

// Subscription Management
export interface AdminSubscription {
  id: string;
  userId: string;
  status: string;
  interval: 'monthly' | 'yearly';
  startedAt: string;
  endsAt: string | null;
  User: {
    id: string;
    email: string;
    fullName: string | null;
    organizationId: string | null;
  };
  subscriptionProducts: Array<{
    id: string;
    Product: AdminProduct;
    ProductPrice: ProductPrice | null;
  }>;
}

// Dashboard Stats
export interface DashboardStats {
  userStats: {
    total: number;
    active: number;
    verified: number;
    admins: number;
    newThisMonth: number;
    activePercentage: number;
  };
  organizationStats: {
    total: number;
    active: number;
    averageUsersPerOrg: number;
  };
  subscriptionStats: {
    active: number;
    cancelled: number;
    monthlyCount: number;
    yearlyCount: number;
    churnRate: number;
  };
  revenueStats: {
    monthlyRecurringRevenueCents: number;
    annualRecurringRevenueCents: number;
    averageRevenuePerUserCents: number;
  };
  usageStats: {
    last30Days: {
      totalTokens: number;
      totalCostCents: number;
    };
    byModel: Array<{
      model: string;
      totalTokens: number;
      totalCostCents: number;
    }>;
    dailyUsage: Array<{
      date: string;
      totalTokens: number;
      totalCostCents: number;
    }>;
  };
  recentActivity: {
    recentUsers: Array<{
      id: string;
      email: string;
      fullName: string | null;
      createdAt: string;
    }>;
    recentSubscriptions: any[];
    recentThreads: any[];
  };
}

// API Functions

// Users
export async function getAdminUsers(
  params: PaginationParams & {
    role?: UserRole;
    isActive?: boolean;
    verified?: boolean;
    organizationId?: string;
  }
): Promise<PaginatedResponse<AdminUser>> {
  const { data } = await api.get('/api/admin/users', { params });
  return data;
}

export async function getAdminUserById(userId: string): Promise<AdminUser> {
  const { data } = await api.get(`/api/admin/users/${userId}`);
  return data;
}

export async function getAdminUserStats(userId: string): Promise<UserStats> {
  const { data } = await api.get(`/api/admin/users/${userId}/stats`);
  return data;
}

export async function updateAdminUser(userId: string, updateDto: UpdateUserDto): Promise<AdminUser> {
  const { data } = await api.patch(`/api/admin/users/${userId}`, updateDto);
  return data;
}

export async function deleteAdminUser(userId: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/api/admin/users/${userId}`);
  return data;
}

// Organizations
export async function getAdminOrganizations(
  params: PaginationParams & { isActive?: boolean }
): Promise<PaginatedResponse<AdminOrganization>> {
  const { data } = await api.get('/api/admin/organizations', { params });
  return data;
}

export async function getAdminOrganizationById(organizationId: string): Promise<AdminOrganization> {
  const { data } = await api.get(`/api/admin/organizations/${organizationId}`);
  return data;
}

export async function getAdminOrganizationStats(organizationId: string): Promise<OrganizationStats> {
  const { data } = await api.get(`/api/admin/organizations/${organizationId}/stats`);
  return data;
}

export async function createAdminOrganization(dto: { name: string; isActive?: boolean }): Promise<AdminOrganization> {
  const { data } = await api.post('/api/admin/organizations', dto);
  return data;
}

export async function updateAdminOrganization(
  organizationId: string,
  dto: { name?: string; isActive?: boolean }
): Promise<AdminOrganization> {
  const { data } = await api.patch(`/api/admin/organizations/${organizationId}`, dto);
  return data;
}

export async function deleteAdminOrganization(organizationId: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/api/admin/organizations/${organizationId}`);
  return data;
}

// Products
export async function getAdminProducts(params: PaginationParams): Promise<PaginatedResponse<AdminProduct>> {
  const { data } = await api.get('/api/admin/products', { params });
  return data;
}

export async function getAdminProductById(productId: string): Promise<AdminProduct> {
  const { data } = await api.get(`/api/admin/products/${productId}`);
  return data;
}

export async function createAdminProduct(dto: CreateProductDto): Promise<AdminProduct> {
  const { data } = await api.post('/api/admin/products', dto);
  return data;
}

export async function updateAdminProduct(
  productId: string,
  dto: { name?: string; description?: string }
): Promise<AdminProduct> {
  const { data } = await api.patch(`/api/admin/products/${productId}`, dto);
  return data;
}

export async function deleteAdminProduct(productId: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/api/admin/products/${productId}`);
  return data;
}

// Subscriptions
export async function getAdminSubscriptions(
  params: PaginationParams & {
    status?: string;
    userId?: string;
    interval?: 'monthly' | 'yearly';
  }
): Promise<PaginatedResponse<AdminSubscription>> {
  const { data } = await api.get('/api/admin/subscriptions', { params });
  return data;
}

export async function getAdminSubscriptionById(subscriptionId: string): Promise<AdminSubscription> {
  const { data } = await api.get(`/api/admin/subscriptions/${subscriptionId}`);
  return data;
}

export async function updateAdminSubscription(
  subscriptionId: string,
  dto: { status?: string; endsAt?: string }
): Promise<AdminSubscription> {
  const { data } = await api.patch(`/api/admin/subscriptions/${subscriptionId}`, dto);
  return data;
}

export async function cancelAdminSubscription(subscriptionId: string): Promise<AdminSubscription> {
  const { data } = await api.post(`/api/admin/subscriptions/${subscriptionId}/cancel`);
  return data;
}

// Stats
export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/api/admin/stats/dashboard');
  return data;
}

export async function getAdminGrowthStats(period: 'day' | 'week' | 'month' = 'month') {
  const { data } = await api.get('/api/admin/stats/growth', { params: { period } });
  return data;
}

// Chat Management
export interface AdminThreadMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminThreadMessagesResponse {
  thread: {
    id: string;
    name: string | null;
    assistantId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  messages: AdminThreadMessage[];
  messageCount: number;
}

export interface AdminThreadDetails {
  id: string;
  name: string | null;
  assistantId: string;
  profileId: string;
  userId: string;
  openaiThreadId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count: {
    Messages: number;
  };
}

export async function getAdminThreadMessages(threadId: string): Promise<AdminThreadMessagesResponse> {
  const { data } = await api.get(`/api/admin/chat/thread/${threadId}/messages`);
  return data;
}

export async function getAdminThreadDetails(threadId: string): Promise<AdminThreadDetails> {
  const { data } = await api.get(`/api/admin/chat/thread/${threadId}`);
  return data;
}