import { useEffect, useState } from 'react';
import { useStore_ChatHistory } from '../chat-history/chat-history-store';
import { useStore_Settings } from '../settings/settings-store';
import { useStore_Chat } from '../chat/chat-store';
import type { Thread } from '../../api/chat-api';

export function useFirstTimeExperience() {
	const chatHistoryStore = useStore_ChatHistory();
	const settingsStore = useStore_Settings();
	const chatStore = useStore_Chat();
	const [alreadyRun, setAlreadyRun] = useState(false);

	useEffect(() => {
		const hasChats = chatHistoryStore.chatsQuery.data && chatHistoryStore.chatsQuery.data.length > 0;
		const isChatsLoading = chatHistoryStore.chatsQuery.isLoading;
		const isSettingsLoading = settingsStore.isLoading;
		
		// Use the user's selected assistant or fall back to first available
		const assistantToUse = settingsStore.settings?.currentAssistantId 
			? settingsStore.assistants.find(a => a.id === settingsStore.settings?.currentAssistantId)
			: settingsStore.assistants[0];

		if (!isChatsLoading && !isSettingsLoading && !hasChats && assistantToUse && !alreadyRun) {
			setAlreadyRun(true);
			// Don't set the assistant ID - let onboarding handle that
			// Just create a chat with the appropriate assistant
			chatHistoryStore.createChatMutation.mutateAsync({ 
				assistantId: assistantToUse.id, 
				profileId: assistantToUse.id 
			})
				.then((newChat: Thread) => {
					chatStore.setCurrentChat(newChat);
				});
		}
	}, [
		chatHistoryStore.chatsQuery.data,
		chatHistoryStore.chatsQuery.isLoading,
		settingsStore.isLoading,
		settingsStore.settings?.currentAssistantId,
		settingsStore.assistants,
		chatHistoryStore.createChatMutation,
		chatStore,
		alreadyRun,
	]);
} 