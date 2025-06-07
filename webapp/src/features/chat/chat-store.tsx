import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { MobxQuery, MobxMutation } from '../../infra/mobx-query';
import {
  getChatMessages,
  type Message,
  createMessage,
  type CreateMessageDto,
  type Thread,
} from '../../api/chat-api';
import { createContext, useContext, useMemo } from 'react';

export class ChatStore {
  currentThread: Thread | null = null;
  messagesQuery: MobxQuery<Message[], unknown, [string, string]> | null = null;
  createMessageMutation: MobxMutation<Message, unknown, CreateMessageDto>;

  constructor() {
    makeAutoObservable(this);
    this.createMessageMutation = new MobxMutation({
      mutationFn: createMessage,
      onSuccess: () => {
        this.messagesQuery?.refetch();
      },
    });

    reaction(
      () => this.currentThread,
      (thread) => {
        runInAction(() => {
          if (thread) {
            this.messagesQuery = new MobxQuery<Message[], unknown, [string, string]>({
              queryKey: ['messages', thread.id],
              queryFn: () => getChatMessages(thread.id),
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

  setCurrentChat(thread: Thread | null) {
    this.currentThread = thread;
  }

  sendMessage(content: string) {
    if (!this.currentThread) return;
    this.createMessageMutation.mutate({
      threadId: this.currentThread.openaiThreadId,
      content,
    });
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