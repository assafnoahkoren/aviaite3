import { useEffect } from 'react';
import { ChatStore } from '../chat/chat-store';
import { ChatHistoryStore } from '../chat-history/chat-history-store';

export const useSelectInitialChat = (
	chatStore: ChatStore,
	chatHistoryStore: ChatHistoryStore
) => {
	useEffect(() => {
		if (!chatStore.currentThread && chatHistoryStore.chatsQuery.data) {
			const sortedChats = [...chatHistoryStore.chatsQuery.data].sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
			if (sortedChats.length > 0) {
				chatStore.setCurrentChat(sortedChats[0]);
			}
		}
	}, [chatStore, chatHistoryStore.chatsQuery.data]);
}; 