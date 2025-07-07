import { createContext, useContext, useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { MobxMutation } from '../../infra/mobx-query';
import { login, register, verify, createResetPasswordToken, resetPassword } from '../../api/user-api';
import type { User } from '../../api/models';
import type { AxiosError } from 'axios';

export class AuthStore {
  loginMutation: MobxMutation<{ message: string; userId: string; token?: string; user?: User }, AxiosError, { email: string; password: string }>;
  registerMutation: MobxMutation<{ message: string; userId: string; token?: string; user?: User }, unknown, { fullName: string; email: string; password: string; token?: string }>;
  verifyMutation: MobxMutation<{ success: boolean; message: string; token: string; user?: User }, unknown, { userId: string; token: string }>;
  createResetPasswordTokenMutation: MobxMutation<{ success: boolean; message: string }, unknown, string>;
  resetPasswordMutation: MobxMutation<{ success: boolean; message: string; user?: User }, unknown, { userId: string; token: string; newPassword: string }>;

  user: User | null = null;
  token: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loginMutation = new MobxMutation({
      mutationFn: login,
    });
    this.registerMutation = new MobxMutation({
      mutationFn: register,
    });
    this.verifyMutation = new MobxMutation({
      mutationFn: verify,
    });
    this.createResetPasswordTokenMutation = new MobxMutation({
      mutationFn: createResetPasswordToken,
    });
    this.resetPasswordMutation = new MobxMutation({
      mutationFn: resetPassword,
    });

    this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    if (token) {
      this.token = token;
    }
    if (user) {
      try {
        this.user = JSON.parse(user);
      } catch (e) {
        this.user = null;
      }
    }
  }

  setCurrentUser(user: User | null, token: string | null) {
    this.user = user;
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }

  logout() {
    this.setCurrentUser(null, null);
    window.location.href = '/login';
  }
}

export function useCreateStore_Auth() {
  const store = useMemo(() => new AuthStore(), []);

  const ContextProvider = useMemo(
    () => (props: any) => (
      <AuthStoreContext.Provider value={store}>
        {props.children}
      </AuthStoreContext.Provider>
    ),
    [store]
  );

  return { store, context: ContextProvider };
}

export const AuthStoreContext = createContext<AuthStore | null>(null);

export function useStore_Auth() {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error('AuthStoreContext not found');
  return store;
}
