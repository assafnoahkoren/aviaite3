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
import { v4 as uuidv4 } from 'uuid';

export class ChatStore {
  currentThread: Thread | null = null;
  messagesQuery: MobxQuery<Message[], unknown, [string, string]> | null = null;
  createMessageMutation: MobxMutation<Message, unknown, CreateMessageDto>;
  private tempMessageId: string | null = null;

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

    this.tempMessageId = uuidv4();
    const tempMessage: Message = {
      id: this.tempMessageId,
      threadId: this.currentThread.openaiThreadId,
      userId: 'temp-user', // This will be updated from the server response
      content,
      createdAt: new Date().toISOString(),
      role: 'user',
    };

    this.messagesQuery?.updateQuery((prev) => [...(prev ?? []), tempMessage]);

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