import React, { useState, useRef, useEffect } from 'react';
import { useQ_getChatMessages, useQ_listChatsByUserId, useM_createMessage } from './api/chat-api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


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
    <div style={{ 
      width: '100%', 
      height: '100%',
      minHeight: 0,
      margin: '0 auto', 
      background: '#f9f9f9', 
      borderRadius: 12, 
      boxShadow: '0 2px 8px #0001', 
      padding: 24, 
      fontFamily: 'Heebo, sans-serif',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ flex: 1, minHeight: 0, maxHeight: '100%', overflowY: 'auto', background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loadingMessages && <div style={{ textAlign: 'center', color: '#888' }}>Loading messages...</div>}
        {allMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                background: msg.role === 'user' ? 'linear-gradient(90deg, #4f8cff 0%, #6fc3ff 100%)' : '#e6e6e6',
                color: msg.role === 'user' ? '#fff' : '#222',
                borderRadius: 16,
                padding: '10px 16px',
                maxWidth: '80%',
                marginBottom: 2,
                boxShadow: msg.role === 'user' ? '0 2px 8px #4f8cff22' : '0 2px 8px #0001',
                fontSize: 15,
                wordBreak: 'break-word',
              }}
            >
              <div className="markdown-body" dir={isRTL(msg.content) ? 'rtl' : 'ltr'}>
                {/* @ts-ignore */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{removeBracketLinks(msg.content)}</ReactMarkdown>
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
              {msg.role === 'user' ? 'You' : 'Assistant'} &middot; {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {waitingForAssistant && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span
              style={{
                display: 'inline-block',
                width: 28,
                height: 28,
                border: '4px solid #e0e7ef',
                borderTop: '4px solid #4f8cff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                verticalAlign: 'middle',
              }}
            />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
      <form
        style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}
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
          style={{ flex: 1, padding: '10px 12px', borderRadius: 16, border: '1px solid #ccc', fontSize: 15 }}
        />
        <button
          type="submit"
          disabled={createMessageMutation.isPending}
          style={{ padding: '10px 18px', borderRadius: 16, background: '#4f8cff', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
        >
          Send
        </button>
        {createMessageMutation.isError && <span style={{ color: 'red', marginLeft: 8 }}>Error sending message</span>}
      </form>
    </div>
  );
}; 


function isRTL(text: string) {
  return new Intl.Collator('ar').compare(text, 'rtl') > 0;
}