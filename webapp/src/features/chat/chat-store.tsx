import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { MobxQuery } from '../../infra/mobx-query';
import { getChatMessages, type Message } from '../../api/chat-api';
import { createContext, useContext, useMemo } from 'react';

export class ChatStore {
  currentChatId: string | null = null;
  messagesQuery: MobxQuery<Message[], unknown, [string, string]> | null = null;

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.currentChatId,
      (chatId) => {
        runInAction(() => {
          if (chatId) {
            this.messagesQuery = new MobxQuery<Message[], unknown, [string, string]>({
              queryKey: ['messages', chatId],
              queryFn: () => getChatMessages(chatId),
              enabled: true,
            });
          } else {
            this.messagesQuery = null;
          }
        });
      },
      { fireImmediately: true }
    );
  }

  setCurrentChatId(id: string | null) {
    this.currentChatId = id;
  }
}

export const ChatStoreContext = createContext<ChatStore | null>(null);

export function useCreateStore_Chat() {
  const store = useMemo(() => new ChatStore(), []);

  const ContextProvider = useMemo(
    () => (props: any) => (
      <ChatStoreContext.Provider value={store}>
        {props.children}
      </ChatStoreContext.Provider>
    ),
    [store]
  );

  return { store, context: ContextProvider };
}

export function useStore_Chat() {
  const store = useContext(ChatStoreContext);
  if (!store) throw new Error('ChatStoreContext not found');
  return store;
} 