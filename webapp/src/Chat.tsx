import React, { useState, useEffect } from 'react';
import { useQ_listChatsByUserId, useM_createChat, useQ_listAssistants } from './api/chat-api';
import type { Thread, Assistant } from './api/chat-api';
import { ChatThread } from './ChatThread';

interface ChatProps {
	userId: string;
}

export const Chat: React.FC<ChatProps> = ({ userId }) => {
	const { data: chats, isLoading, error } = useQ_listChatsByUserId(userId);
	const createChatMutation = useM_createChat();
	const { data: assistants, isLoading: loadingAssistants, error: assistantsError } = useQ_listAssistants();

	const [assistantId, setAssistantId] = useState('');
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

	useEffect(() => {
		if (createChatMutation.isSuccess && createChatMutation.data && createChatMutation.data.id) {
			setSelectedChatId(createChatMutation.data.id);
		}
	}, [createChatMutation.isSuccess, createChatMutation.data]);

	useEffect(() => {
		if (chats && chats.length > 0 && !selectedChatId) {
			setSelectedChatId(chats[0].id);
		}
	}, [chats, selectedChatId]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!assistantId) return;
		const selectedAssistant = assistants?.find((a: Assistant) => a.id === assistantId);
		const profileId = selectedAssistant?.name || '';
		if (!profileId) return;
		createChatMutation.mutate({ userId, assistantId, profileId });
		setAssistantId('');
	};

	const handleChatPick = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedChatId(e.target.value);
	};

	const selectedChat = chats?.find((chat) => chat.id === selectedChatId) || null;

	return (
		<div>
			<h2>Chats</h2>
			{isLoading && <div>Loading...</div>}
			{error && <div>Error loading chats</div>}
			{chats && chats.length > 0 && (
				<div style={{ marginBottom: 16 }}>
					<label>Pick a chat: </label>
					<select value={selectedChatId || ''} onChange={handleChatPick}>
						{chats.map((chat) => (
							<option key={chat.id} value={chat.id}>
								{chat.assistantId} | {new Date(chat.createdAt).toLocaleString()}
							</option>
						))}
					</select>
				</div>
			)}

			{selectedChat && <ChatThread key={selectedChat.id} chat={selectedChat} userId={userId} />}
			<h3>Create New Chat</h3>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Assistant: </label>
					{loadingAssistants && <span>Loading assistants...</span>}
					{assistantsError && <span style={{ color: 'red' }}>Error loading assistants</span>}
					<select
						value={assistantId}
						onChange={e => setAssistantId(e.target.value)}
						required
						disabled={loadingAssistants || !assistants}
					>
						<option value="">Select an assistant</option>
						{assistants && assistants.map((assistant: Assistant) => (
							<option key={assistant.id} value={assistant.id}>
								{assistant.label || assistant.name}
							</option>
						))}
					</select>
				</div>
				<button type="submit" disabled={createChatMutation.isPending || loadingAssistants || !assistants}>Create Chat</button>
				{createChatMutation.isError && <span style={{ color: 'red' }}>Error creating chat</span>}
			</form>
		</div>
	);
}; 