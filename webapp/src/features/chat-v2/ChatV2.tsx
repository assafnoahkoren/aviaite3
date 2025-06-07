import { Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Chat } from '../chat/chat-store';

export const ChatV2 = observer(() => {
  const chatStore = useStore_Chat();

  return <Text>Current Chat ID: {chatStore.currentChatId}</Text>;
}); 