import { makeAutoObservable, runInAction } from 'mobx';
import { QueryClient, QueryObserver, MutationObserver } from '@tanstack/react-query';
import type { QueryObserverOptions, MutationObserverOptions } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export class MobxQuery<TData = unknown, TError = unknown, TQueryKey extends readonly unknown[] = readonly unknown[]> {
  data: TData | undefined = undefined;
  error: TError | null = null;
  isLoading = false;
  isSuccess = false;
  isError = false;

  private observer: QueryObserver<TData, TError, TData, TData, TQueryKey>;

  constructor(options: QueryObserverOptions<TData, TError, TData, TData, TQueryKey>) {
    makeAutoObservable(this);
    this.observer = new QueryObserver<TData, TError, TData, TData, TQueryKey>(queryClient, options);
    this.isLoading = true;
    this.observer.subscribe(result => {
      runInAction(() => {
        this.data = result.data;
        this.error = result.error ?? null;
        this.isLoading = result.isLoading;
        this.isSuccess = result.isSuccess;
        this.isError = result.isError;
      });
    });
    this.observer.updateResult();
  }

  refetch() {
    return this.observer.refetch();
  }

  updateQuery(updater: (prev: TData | undefined) => TData) {
    queryClient.setQueryData(this.observer.options.queryKey, updater as any);
  }

  setQueryData(data: TData) {
    queryClient.setQueryData(this.observer.options.queryKey, data as any);
  }
}

export class MobxMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown> {
  data: TData | undefined = undefined;
  error: TError | null = null;
  isLoading = false;
  isSuccess = false;
  isError = false;

  private observer: MutationObserver<TData, TError, TVariables, TContext>;

  constructor(options: MutationObserverOptions<TData, TError, TVariables, TContext>) {
    makeAutoObservable(this);
    this.observer = new MutationObserver(queryClient, options);
    this.observer.subscribe(result => {
      runInAction(() => {
        this.data = result.data;
        this.error = result.error ?? null;
        this.isLoading = result.isPending;
        this.isSuccess = result.isSuccess;
        this.isError = result.isError;
      });
    });
  }

  mutate(variables: TVariables) {
    // Prevent unhandled promise rejection for fire-and-forget mutations
    this.observer.mutate(variables).catch((error) => {
      console.error('Unhandled promise rejection in mutation', error);
    });
  }

  mutateAsync(variables: TVariables) {
    return this.observer.mutate(variables);
  }
}
