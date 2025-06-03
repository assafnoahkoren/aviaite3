import React from 'react';
import styles from './chat-area.module.scss';
import { useStore_Chat } from '../chat/chat-store';
import { observer } from 'mobx-react-lite';
import { ChatThread } from '../../ChatThread';
function ChatArea() {
  const chatStore = useStore_Chat();
  const currentChatId = chatStore.currentChatId;
  
  return (
    <div className={styles.chatArea}>
      {currentChatId && <ChatThread key={currentChatId} chatId={currentChatId} />}
    </div>
  );
}

export default observer(ChatArea); 