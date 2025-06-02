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

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const res = await api.post('/api/users/register', dto);
  return res.data;
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const res = await api.post('/api/users/login', dto);
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