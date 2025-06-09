import { useDisclosure } from '@mantine/hooks';
import { useCreateStore_ChatHistory } from '../chat-history/chat-history-store';
import { observer } from 'mobx-react-lite';
import ChatArea from './chat-area';
import styles from './home-page.module.scss';
import { Burger, Drawer } from '@mantine/core';

const HomePage = observer(() => {
  const [opened, { open, close }] = useDisclosure(false);

  // Providers still needed for context
  const chatHistoryStore = useCreateStore_ChatHistory();
  return (
    <chatHistoryStore.context>
      <>
        <div className={styles.container}>
          <Burger
            opened={opened}
            onClick={open}
            aria-label="Toggle navigation"
            className={styles.burger}
          />
          <Drawer opened={opened} onClose={close} withCloseButton={false} size="auto">
            {/* <Sidebar onClose={close} /> */}
          </Drawer>

          {/* <Sidebar className={styles.mainSidebar} /> */}
          <ChatArea />
        </div>
      </>
    </chatHistoryStore.context>
  );
});

export default HomePage; 