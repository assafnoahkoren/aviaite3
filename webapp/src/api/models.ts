export interface User {
  id: string;
  fullName?: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  verified: boolean;
  organizationId?: string | null;
  roles: UserRole[];
}

export type UserRole = 'ADMIN' | 'USER';

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