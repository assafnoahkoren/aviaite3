import React, { useState, useRef, useEffect } from 'react';
import { useQ_getChatMessages, useQ_listChatsByUserId, useM_createMessage } from './api/chat-api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Text, Box } from '@mantine/core';
import styles from './ChatThread.module.scss';
import { EmptyThreadPlaceholder } from './EmptyThreadPlaceholder';

const actionButtons = [
  'תרחיב',
  'תמקד',
  'תקצר',
  'רכז לי בטבלה',
  'תתרגם לאנגלית',
  'תבדוק שוב את התשובה',
];

// Add Heebo font via Google Fonts
const heeboFontLink = document.getElementById('heebo-font');
if (!heeboFontLink) {
  const link = document.createElement('link');
  link.id = 'heebo-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&display=swap';
  document.head.appendChild(link);
}

interface ChatThreadProps {
  chatId: string;
}

// Utility to remove custom bracket link syntax
function removeBracketLinks(text: string) {
  return text.replace(/【\d+:\d+†[^】]+?】/g, '');
}

export const ChatThread: React.FC<ChatThreadProps> = ({ chatId }) => {
  const { data: chats } = useQ_listChatsByUserId();
  const chat = chats?.find((c) => c.id === chatId);

  

  const { data: messages, isLoading: loadingMessages } = useQ_getChatMessages(chatId);
  const createMessageMutation = useM_createMessage();
  const [messageInput, setMessageInput] = useState('');
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [waitingForAssistant, setWaitingForAssistant] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Combine server messages and local optimistic messages
  const allMessages = [...(messages || []), ...localMessages];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, waitingForAssistant]);

  if (!chat) return null;

  const simulateSendMessage = (content: string) => {
    if (!content) return;
    const userMessage = {
      id: `local-user-${Date.now()}`,
      threadId: chat.id,
      content: content,
      createdAt: new Date().toISOString(),
      role: 'user',
    };
    setLocalMessages((prev) => [...prev, userMessage]);
    setWaitingForAssistant(true);
    createMessageMutation.mutate(
      { threadId: chat.openaiThreadId, content: userMessage.content },
      {
        onSuccess: (result) => {
          const assistantResponse = (result as any).assistantResponse;
          if (assistantResponse) {
            const assistantMessage = {
              id: `local-assistant-${Date.now()}`,
              threadId: chat.id,
              userId: 'assistant',
              content: assistantResponse,
              createdAt: new Date().toISOString(),
              role: 'assistant',
            };
            setLocalMessages((prev) => [...prev, assistantMessage]);
          }
          setWaitingForAssistant(false);
        },
        onError: () => {
          setWaitingForAssistant(false);
        },
      }
    );
  };

  const handleSendMessage = () => {
    if (!messageInput) return;
    const userMessage = {
      id: `local-user-${Date.now()}`,
      threadId: chat.id,
      content: messageInput,
      createdAt: new Date().toISOString(),
      role: 'user',
    };
    setLocalMessages((prev) => [...prev, userMessage]);
    setMessageInput('');
    setWaitingForAssistant(true);
    createMessageMutation.mutate(
      { threadId: chat.openaiThreadId, content: userMessage.content },
      {
        onSuccess: (result) => {
          const assistantResponse = (result as any).assistantResponse;
          if (assistantResponse) {
            const assistantMessage = {
              id: `local-assistant-${Date.now()}`,
              threadId: chat.id,
              userId: 'assistant',
              content: assistantResponse,
              createdAt: new Date().toISOString(),
              role: 'assistant',
            };
            setLocalMessages((prev) => [...prev, assistantMessage]);
          }
          setWaitingForAssistant(false);
        },
        onError: () => {
          setWaitingForAssistant(false);
        }
      }
    );
  };

  return (
    <div className={styles.chatThread}>
      <div className={styles.messagesContainer}>
        {loadingMessages && <div className={styles.loadingMessages}>Loading messages...</div>}
        {!loadingMessages && allMessages.length === 0 && (
          <EmptyThreadPlaceholder onQuestionClick={simulateSendMessage} />
        )}
        {allMessages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.user : ''}`}
          >
            <div
              className={`${styles.messageBubble} ${msg.role === 'user' ? styles.user : ''}`}
            >
              <div className="markdown-body" dir={isRTL(msg.content) ? 'rtl' : 'ltr'}>
                {/* @ts-ignore */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{removeBracketLinks(msg.content)}</ReactMarkdown>
              </div>
            </div>
            {msg.role === 'assistant' && (
              <div className={styles.actionButtons}>
                {actionButtons.map((text) => (
                  <button key={text} className={styles.actionButton} onClick={() => simulateSendMessage(text)}>
                    {text}
                  </button>
                ))}
              </div>
            )}
            <span className={styles.timestamp}>
              {msg.role === 'user' ? 'You' : 'Assistant'} &middot; {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {waitingForAssistant && (
          <div className={styles.waitingForAssistant}>
            <span className={styles.spinner} />
          </div>
        )}
      </div>
      <form
        className={styles.messageForm}
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          className={styles.messageInput}
        />
        <button
          type="submit"
          disabled={createMessageMutation.isPending}
          className={styles.sendButton}
        >
          Send
        </button>
        {createMessageMutation.isError && <span className={styles.errorMessage}>Error sending message</span>}
      </form>
      <Box p="md">
        <Text size="xs" c="dimmed" ta="center">
          Information provided by this platform may not be accurate or up-to-date. Always verify any information from original sources before making decisions.
        </Text>
      </Box>
    </div>
  );
}; 


function isRTL(text: string) {
  return new Intl.Collator('ar').compare(text, 'rtl') > 0;
}