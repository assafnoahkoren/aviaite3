import { createContext, useContext } from 'react';
import { makeAutoObservable } from 'mobx';
import { MobxMutation } from '../../infra/mobx-query';
import { login, register } from '../../api/user-api';
import type { LoginDto, RegisterDto, AuthResponse } from '../../api/user-api';

export class AuthStore {
  loginMutation: MobxMutation<AuthResponse, unknown, LoginDto>;
  registerMutation: MobxMutation<AuthResponse, unknown, RegisterDto>;

  constructor() {
    makeAutoObservable(this);
    this.loginMutation = new MobxMutation<AuthResponse, unknown, LoginDto>({
      mutationFn: login,
    });
    this.registerMutation = new MobxMutation<AuthResponse, unknown, RegisterDto>({
      mutationFn: register,
    });
  }
}

export function useCreateStore_Auth() {
  const store = new AuthStore();
  const context = createContext<AuthStore>(store);
  return { store, context };
}

export const AuthStoreContext = createContext<AuthStore | null>(null);

export function useStore_Auth() {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error('AuthStoreContext not found');
  return store;
}
