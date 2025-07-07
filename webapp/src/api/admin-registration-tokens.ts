import { api } from './index';

export interface RegistrationToken {
  id: string;
  token: string;
  label: string | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  usedByUser: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
  isExpired: boolean;
  isUsed: boolean;
  registrationUrl: string;
}

export interface GenerateTokenResponse {
  id: string;
  token: string;
  label: string | null;
  registrationUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface TokensResponse {
  data: RegistrationToken[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminRegistrationTokensApi = {
  generateToken: (label?: string) =>
    api.post<GenerateTokenResponse>('/api/admin/registration-tokens', { label }),

  getTokens: (page = 1, limit = 10) =>
    api.get<TokensResponse>('/api/admin/registration-tokens', {
      params: { page, limit },
    }),

  deleteToken: (tokenId: string) =>
    api.delete(`/api/admin/registration-tokens/${tokenId}`),
};