import { api } from './index';
import { useMutation } from '@tanstack/react-query';

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  userId: string;
  token?: string;
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  token: string;
  user?: {
    id: string;
    fullName?: string | null;
    email: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    verified: boolean;
    organizationId?: string | null;
    // Add other non-sensitive fields if needed
  };
}

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const res = await api.post('/api/users/register', dto);
  return res.data;
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const res = await api.post('/api/users/login', dto);
  return res.data;
}

export async function verify({ userId, token }: { userId: string; token: string }): Promise<VerifyResponse> {
  const res = await api.get(`/api/users/verify?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`);
  return res.data;
}

export function useM_register() {
  return useMutation({
    mutationFn: register,
  });
}

export function useM_login() {
  return useMutation({
    mutationFn: login,
  });
}

export function useM_verify() {
  return useMutation({
    mutationFn: verify,
  });
} 
