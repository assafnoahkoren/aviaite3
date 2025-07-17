import { observer } from 'mobx-react-lite';
import { useStore_ChatHistory } from '../chat-history/chat-history-store';
import { Stack, Text } from '@mantine/core';
import { ChatCard } from './ChatCard';
import classes from './ChatHistoryList.module.scss';

interface ChatHistoryListProps {
  closeSidebar?: () => void;
}

export const ChatHistoryList = observer(({ closeSidebar }: ChatHistoryListProps) => {
  const chatHistoryStore = useStore_ChatHistory();

  if (chatHistoryStore.chatsQuery.isLoading) {
    return null;
  }

  if (chatHistoryStore.chatsQuery.isError) {
    return <Text>Error loading chats.</Text>;
  }

  const chats = chatHistoryStore.chatsQuery.data ?? [];

  return (
    <Stack gap="0" p="sm" pt="0" className={classes.scrollable} style={{ flex: 1, overflowY: 'auto' }} data-tour="chat-history">
      {chats.map((chat) => (
        <ChatCard key={chat.id} chat={chat} closeSidebar={closeSidebar} />
      ))}
    </Stack>
  );
}); 