import React, { useState } from 'react';
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
          <ChatThread key={chat.id} chat={chat} userId={userId} />
        ))}
      </ul>
      <h3>Create New Chat</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Assistant: </label>
          {loadingAssistants && <span>Loading assistants...</span>}
          {assistantsError && <span style={{color: 'red'}}>Error loading assistants</span>}
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
        <div>
          <label>Profile ID: </label>
          <input value={profileId} onChange={e => setProfileId(e.target.value)} required />
        </div>
        <button type="submit" disabled={createChatMutation.isPending || loadingAssistants || !assistants}>Create Chat</button>
        {createChatMutation.isError && <span style={{color: 'red'}}>Error creating chat</span>}
      </form>
    </div>
  );
}; 