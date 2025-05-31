import React, { useState } from 'react';
import { useQ_listChatsByUserId, useM_createChat } from './api/chat-api';
import type { Thread } from './api/chat-api';

interface ChatProps {
  userId: string;
}

export const Chat: React.FC<ChatProps> = ({ userId }) => {
  const { data: chats, isLoading, error } = useQ_listChatsByUserId(userId);
  const createChatMutation = useM_createChat();

  const [assistantId, setAssistantId] = useState('');
  const [profileId, setProfileId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantId || !profileId) return;
    createChatMutation.mutate({ userId, assistantId, profileId });
    setAssistantId('');
    setProfileId('');
  };

  return (
    <div>
      <h2>Chats</h2>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error loading chats</div>}
      <ul>
        {chats && chats.map((chat: Thread) => (
          <li key={chat.id}>
            <strong>Assistant:</strong> {chat.assistantId} | <strong>Profile:</strong> {chat.profileId} | <strong>Created:</strong> {new Date(chat.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
      <h3>Create New Chat</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Assistant ID: </label>
          <input value={assistantId} onChange={e => setAssistantId(e.target.value)} required />
        </div>
        <div>
          <label>Profile ID: </label>
          <input value={profileId} onChange={e => setProfileId(e.target.value)} required />
        </div>
        <button type="submit" disabled={createChatMutation.isPending}>Create Chat</button>
        {createChatMutation.isError && <span style={{color: 'red'}}>Error creating chat</span>}
      </form>
    </div>
  );
}; 