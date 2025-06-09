import { useEffect } from 'react';
import { useStore_ChatHistory } from '../chat-history/chat-history-store';
import { useStore_Settings } from '../settings/settings-store';
import { useStore_Chat } from '../chat/chat-store';
import type { Thread } from '../../api/chat-api';

export function useFirstTimeExperience() {
  const chatHistoryStore = useStore_ChatHistory();
  const settingsStore = useStore_Settings();
  const chatStore = useStore_Chat();

  useEffect(() => {
    const hasChats = chatHistoryStore.chatsQuery.data && chatHistoryStore.chatsQuery.data.length > 0;
    const isChatsLoading = chatHistoryStore.chatsQuery.isLoading;
	const currentAssistant = settingsStore.assistants.find(a => a.id === settingsStore.assistants[0].id);
	settingsStore.setCurrentAssistantId(currentAssistant?.id);

    if (!isChatsLoading && !hasChats && currentAssistant) {
      chatHistoryStore.createChatMutation.mutateAsync({ assistantId: currentAssistant.id, profileId: currentAssistant.id })
        .then((newChat: Thread) => {
          chatStore.setCurrentChat(newChat);
        });
    }
  }, [
    chatHistoryStore.chatsQuery.data,
    chatHistoryStore.chatsQuery.isLoading,
    settingsStore.currentAssistant,
    chatHistoryStore.createChatMutation,
    chatStore,
  ]);
} 