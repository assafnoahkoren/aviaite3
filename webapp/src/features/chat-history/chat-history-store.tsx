import { createContext, useContext, useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { MobxQuery, MobxMutation } from '../../infra/mobx-query';
import { listChatsByUserId, createChat, type Thread, type CreateChatDto } from '../../api/chat-api';

export class ChatHistoryStore {
  chatsQuery: MobxQuery<Thread[], unknown, [string]>;
  createChatMutation: MobxMutation<Thread, unknown, CreateChatDto>;

  constructor() {
    makeAutoObservable(this);
    this.chatsQuery = new MobxQuery<Thread[], unknown, [string]>({
      queryKey: ['chats'],
      queryFn: listChatsByUserId,
      enabled: true,
    });
    this.createChatMutation = new MobxMutation({
      mutationFn: createChat,
      onSuccess: () => {
        this.chatsQuery.refetch();
      },
    });
  }
} 
export const ChatHistoryStoreContext = createContext<ChatHistoryStore | null>(null);

export function useCreateStore_ChatHistory() {
  const store = useMemo(() => new ChatHistoryStore(), []);

  const ContextProvider = useMemo(
    () => (props: any) => (
      <ChatHistoryStoreContext.Provider value={store}>
        {props.children}
      </ChatHistoryStoreContext.Provider>
    ),
    [store]
  );

  return { store, context: ContextProvider };
}

export function useStore_ChatHistory() {
  const store = useContext(ChatHistoryStoreContext);
  if (!store) throw new Error('ChatHistoryStoreContext not found');
  return store;
} 