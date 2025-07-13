import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { MobxQuery, MobxMutation, getQueryClient } from '../../infra/mobx-query';
import {
  getChatMessages,
  type Message,
  createMessage,
  type CreateMessageDto,
  type Thread,
  streamChat,
  type Assistant,
  generateChatName,
} from '../../api/chat-api';
import { createContext, useContext, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { SettingsStore } from '../settings/settings-store';
import { showMissingSubscriptionModal } from '../subscription/MissingSubscriptionModal';

export class ChatStore {
  currentThread: Thread | null = null;
  messagesQuery: MobxQuery<Message[], unknown, [string, string]> | null = null;
  createMessageMutation: MobxMutation<Message, unknown, CreateMessageDto>;
  generateChatNameMutation: MobxMutation<{ name: string }, unknown, string>;
  private tempMessageId: string | null = null;
  isStreaming = false;
  streamingMessageId: string | null = null;
  isStreamLoading = false;
  settingsStore: SettingsStore;

  constructor(settingsStore: SettingsStore) {
    makeAutoObservable(this);
    this.settingsStore = settingsStore;
    this.createMessageMutation = new MobxMutation({
      mutationFn: createMessage,
      onSuccess: () => {
        this.messagesQuery?.refetch();
      },
      onError: (error: any) => {
        if (error?.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
          showMissingSubscriptionModal(error);
        }
      },
    });

    this.generateChatNameMutation = new MobxMutation({
      mutationFn: generateChatName,
      onSuccess: (data) => {
        if (this.currentThread) {
          runInAction(() => {
            if (this.currentThread) {
              this.currentThread.name = data.name;
            }
          });
        }
        getQueryClient().invalidateQueries({ queryKey: ['chats'] });
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
    if (!this.currentThread || this.isStreaming) return;

    this.tempMessageId = uuidv4();
    const tempMessage: Message = {
      id: this.tempMessageId,
      threadId: this.currentThread.openaiThreadId,
      userId: 'temp-user',
      content,
      createdAt: new Date().toISOString(),
      role: 'user',
    };

    this.messagesQuery?.updateQuery((prev) => [...(prev ?? []), tempMessage]);

    this.createMessageMutation.mutate({
      threadId: this.currentThread.openaiThreadId,
      content,
    });

    this.streamThread();
    
  }

  currentAssistant(): Assistant | undefined {
    return this.settingsStore.assistants.find((a) => a.id === this.currentThread?.assistantId);
  }

  streamThread() {
    if (!this.currentThread) return;

    this.isStreaming = true;
    runInAction(() => {
      this.isStreamLoading = true;
    });
    this.streamingMessageId = uuidv4();

    streamChat(this.currentThread.openaiThreadId, {
      onTextDelta: (value: string) => {
        if (this.isStreamLoading) {
          runInAction(() => {
            this.isStreamLoading = false;
          });
        }
        this.messagesQuery?.updateQuery((prev) => {
          const messages = prev ?? [];
          const streamingMessage = messages.find((m) => m.id === this.streamingMessageId);

          if (streamingMessage) {
            return messages.map((m) =>
              m.id === this.streamingMessageId ? { ...m, content: m.content + value } : m
            );
          } else {
            if (!this.currentThread || !this.streamingMessageId) {
              return messages;
            }
            const newAssistantMessage: Message = {
              id: this.streamingMessageId,
              threadId: this.currentThread.openaiThreadId,
              userId: 'assistant',
              content: value,
              createdAt: new Date().toISOString(),
              role: 'assistant',
            };
            return [...messages, newAssistantMessage];
          }
        });
      },
      onEnd: () => {
        if (
          this.currentThread &&
          !this.currentThread.name &&
          (this.messagesQuery?.data?.length ?? 0) <= 3
        ) {
          this.generateChatNameMutation.mutate(
            this.currentThread.openaiThreadId,
          );
        }
        runInAction(() => {
          this.isStreaming = false;
          this.streamingMessageId = null;
          this.isStreamLoading = false;
        });
      },
      onError: (error: any) => {
        console.error('Stream error:', error);
        runInAction(() => {
          this.isStreaming = false;
          this.streamingMessageId = null;
          this.isStreamLoading = false;
        });
        
        // Check if it's a subscription error
        if (error?.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
          showMissingSubscriptionModal(error);
        }
      },
    });
  }
}

export const ChatStoreContext = createContext<ChatStore | null>(null);

export function useCreateStore_Chat(settingsStore: SettingsStore) {
  const store = useMemo(() => new ChatStore(settingsStore), [settingsStore]);

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