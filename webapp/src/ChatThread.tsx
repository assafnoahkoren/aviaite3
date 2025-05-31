import React, { useState } from 'react';
import { useQ_getChatMessages, useM_createMessage } from './api/chat-api';
import type { Thread } from './api/chat-api';

interface ChatThreadProps {
  chat: Thread;
  userId: string;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ chat, userId }) => {
  const { data: messages, isLoading: loadingMessages } = useQ_getChatMessages(chat.id);
  const createMessageMutation = useM_createMessage();
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (!messageInput) return;
    createMessageMutation.mutate(
      { threadId: chat.openaiThreadId, userId, content: messageInput },
      { onSuccess: () => setMessageInput('') }
    );
  };

  return (
    <li>
      <div>
        <strong>Assistant:</strong> {chat.assistantId} | <strong>Profile:</strong> {chat.profileId} | <strong>Created:</strong> {new Date(chat.createdAt).toLocaleString()}
      </div>
      <div>
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
        />
        <button
          onClick={handleSendMessage}
          disabled={createMessageMutation.isPending}
        >
          Send
        </button>
        {createMessageMutation.isError && <span style={{ color: 'red' }}>Error sending message</span>}
      </div>
      <ul>
        {loadingMessages && <li>Loading messages...</li>}
        {messages && messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.userId}:</strong> {msg.content} <em>({new Date(msg.createdAt).toLocaleTimeString()})</em>
          </li>
        ))}
      </ul>
    </li>
  );
}; 