import { useCreateStore_ChatHistory } from '../chat-history/chat-history-store';
import { observer } from 'mobx-react-lite';
import Sidebar from './sidebar';
import ChatArea from './chat-area';
import styles from './home-page.module.scss';
import { useCreateStore_Chat } from '../chat/chat-store';

const HomePage = observer(() => {
  // Providers still needed for context
  const chatHistoryStore = useCreateStore_ChatHistory();
  const chatStore = useCreateStore_Chat();
  return (
    <chatHistoryStore.context>
      <chatStore.context>
        <div className={styles.container}>
          <Sidebar />
          <ChatArea />
        </div>
      </chatStore.context>
    </chatHistoryStore.context>
  );
});

export default HomePage; 