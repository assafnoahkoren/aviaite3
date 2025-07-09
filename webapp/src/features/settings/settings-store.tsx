import { createContext, useContext, useMemo } from 'react';
import { makeAutoObservable, reaction } from 'mobx';
import { getSettings, updateSettings } from '../../api/user-api';
import type { UserSettings } from './settings';
import { MobxQuery, MobxMutation } from '../../infra/mobx-query';
import { listAssistants, type Assistant } from '../../api/chat-api';
import type { AuthStore } from '../auth/auth-store';


export class SettingsStore {
  settingsQuery: MobxQuery<UserSettings | null, unknown, [string]>;
  updateSettingsMutation: MobxMutation<UserSettings, unknown, UserSettings>;
  assistantsQuery: MobxQuery<Assistant[], unknown, [string]>;
  authStore: AuthStore;
  isSwitchAssistantModalOpen = false;

  constructor(authStore: AuthStore) {
    makeAutoObservable(this);
	this.authStore = authStore;

    this.settingsQuery = new MobxQuery({
      queryKey: ['settings'],
      queryFn: getSettings,
    });

    this.updateSettingsMutation = new MobxMutation({
      mutationFn: updateSettings,
    });

    this.assistantsQuery = new MobxQuery({
      queryKey: ['assistants'],
      queryFn: listAssistants,
    });

    // Removed automatic assistant selection to avoid race conditions
    // Assistant selection should only happen through onboarding or manual selection
  }

  openSwitchAssistantModal = () => {
    this.isSwitchAssistantModalOpen = true;
  };

  closeSwitchAssistantModal = () => {
    this.isSwitchAssistantModalOpen = false;
  };

  get settings(): UserSettings | null {
    return this.settingsQuery.data ?? null;
  }

  get isLoading(): boolean {
    return this.settingsQuery.isLoading;
  }

  get assistants(): Assistant[] {
	const role = this.authStore.user?.role;
    return this.assistantsQuery.data?.filter(a => !a.devAssistant || role === 'ADMIN') ?? [];
  }

  setCurrentAssistantId(assistantId?: string) {
    let newSettings: UserSettings = {}
	newSettings = {
		...(this.settings ?? {}),
		currentAssistantId: assistantId,
	}
    this.updateSettingsMutation.mutate(newSettings);
	this.settingsQuery.setQueryData(newSettings);
  }

  get currentAssistant(): Assistant | undefined {
    const assistants = this.assistantsQuery.data;
    const currentAssistantId = this.settings?.currentAssistantId;
    if (!assistants || !currentAssistantId) {
      return undefined;
    }
    return assistants.find((a) => a.id === currentAssistantId);
  }

  refetchSettings() {
    return this.settingsQuery.refetch();
  }
}

export function useCreateStore_Settings(authStore: AuthStore) {
  const store = useMemo(() => new SettingsStore(authStore), [authStore]);

  const context = useMemo(
    () => (props: { children: React.ReactNode }) => (
      <SettingsStoreContext.Provider value={store}>
        {props.children}
      </SettingsStoreContext.Provider>
    ),
    [store],
  );

  return { store, context };
}

export const SettingsStoreContext = createContext<SettingsStore | null>(null);

export function useStore_Settings() {
  const store = useContext(SettingsStoreContext);
  if (!store) throw new Error('SettingsStoreContext not found');
  return store;
} 