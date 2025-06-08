import { api } from './index';
import { useMutation } from '@tanstack/react-query';
import type { User } from './models';
import type { UserSettings } from '../features/settings/settings';

export interface AuthResponse {
  message: string;
  userId: string;
  token?: string;
  user?: User;
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  token: string;
  user?: User;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ResetPasswordDto {
  userId: string;
  token: string;
  newPassword: string;
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

export async function createResetPasswordToken(email: string): Promise<ResetPasswordResponse> {
  const res = await api.post('/api/users/reset-password-token', { email });
  return res.data;
}

export async function resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResponse> {
  const res = await api.post('/api/users/reset-password', dto);
  return res.data;
}

export async function getSettings(): Promise<UserSettings | null> {
  const res = await api.get('/api/users/settings');
  return res.data as UserSettings | null;
}

export async function updateSettings(settings: UserSettings): Promise<UserSettings> {
  const res = await api.patch('/api/users/settings', settings);
  return res.data as UserSettings;
}

export async function deleteSettings(): Promise<void> {
  await api.delete('/api/users/settings');
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

export function useM_resetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

export function useM_createResetPasswordToken() {
  return useMutation({
    mutationFn: createResetPasswordToken,
  });
}

export function useM_getSettings() {
  return useMutation({
    mutationFn: getSettings,
  });
}

export function useM_updateSettings() {
  return useMutation({
    mutationFn: updateSettings,
  });
}

export function useM_deleteSettings() {
  return useMutation({
    mutationFn: deleteSettings,
  });
} 
