import { createContext, useContext, useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { MobxMutation } from '../../infra/mobx-query';
import { login, register, verify } from '../../api/user-api';
import type { LoginDto, RegisterDto, AuthResponse, VerifyResponse } from '../../api/user-api';

export class AuthStore {
  loginMutation: MobxMutation<AuthResponse, unknown, LoginDto>;
  registerMutation: MobxMutation<AuthResponse, unknown, RegisterDto>;
  verifyMutation: MobxMutation<VerifyResponse, unknown, { userId: string; token: string }>;

  user: VerifyResponse['user'] | null = null;
  token: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loginMutation = new MobxMutation<AuthResponse, unknown, LoginDto>({
      mutationFn: login,
    });
    this.registerMutation = new MobxMutation<AuthResponse, unknown, RegisterDto>({
      mutationFn: register,
    });
    this.verifyMutation = new MobxMutation<VerifyResponse, unknown, { userId: string; token: string }>({
      mutationFn: verify,
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

  setCurrentUser(user: VerifyResponse['user'] | null, token: string | null) {
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
