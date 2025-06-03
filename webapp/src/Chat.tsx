import React from 'react';
import { useQ_listChatsByUserId, useQ_listAssistants } from './api/chat-api';
import { ChatThread } from './ChatThread';

interface ChatProps {
	chatId: string | null;
}

export const Chat: React.FC<ChatProps> = ({ chatId }) => {
	const { data: chats, isLoading, error } = useQ_listChatsByUserId();
	useQ_listAssistants(); // Only for possible cache, not used directly

	const selectedChat = chats?.find((chat) => chat.id === chatId) || null;

	if (!chatId || !selectedChat) return null;

	return (
		<div>
			<ChatThread key={selectedChat.id} chatId={selectedChat.id} />
		</div>
	);
}; 