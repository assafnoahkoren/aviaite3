import { Box, Button, LoadingOverlay, Select, Stack, Text } from '@mantine/core';
import { ChatHistoryList } from './ChatHistoryList';
import { IconPencilPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { useStore_ChatHistory } from '../chat-history/chat-history-store';
import { useStore_Chat } from '../chat/chat-store';
import { useQ_listAssistants } from '../../api/chat-api';
import { useState } from 'react';
import { useStore_Auth } from '../auth/auth-store';

export const HomeSidebar = observer(() => {
  const chatHistoryStore = useStore_ChatHistory();
  const chatStore = useStore_Chat();
  const auth = useStore_Auth();
  const { data: assistants = [], isLoading: loadingAssistants } = useQ_listAssistants();
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);

  if (!selectedAssistantId && assistants.length > 0) {
    setSelectedAssistantId(assistants[0].id);
  }

  const handleNewChat = () => {
    if (!selectedAssistantId || !auth.user) return;
    chatHistoryStore.createChatMutation
      .mutateAsync({
        assistantId: selectedAssistantId,
        profileId: auth.user.id,
      })
      .then((newChat) => {
        chatStore.setCurrentChat(newChat);
      });
  };

  return (
    <Stack style={{ height: '100%', position: 'relative' }} gap="0">
      <LoadingOverlay
        visible={
          !chatHistoryStore.chatsQuery.data?.length && (chatHistoryStore.createChatMutation.isLoading || chatHistoryStore.chatsQuery.isLoading)
        }
      />
      <Box p="md" pb="0">
        <Button
          fullWidth
          variant="outline"
          rightSection={<IconPencilPlus size={16} />}
          onClick={handleNewChat}
          loading={chatHistoryStore.createChatMutation.isLoading}
          disabled={!selectedAssistantId || chatHistoryStore.createChatMutation.isLoading}
        >
          New Chat
        </Button>
      </Box>
      <Box p="md" pb="0">
        <Select
          data={assistants.map((a) => ({ value: a.id, label: a.label || a.name }))}
          value={selectedAssistantId}
          onChange={setSelectedAssistantId}
          placeholder={loadingAssistants ? 'Loading assistants...' : 'Pick an assistant'}
          disabled={loadingAssistants || assistants.length === 0}
        />
      </Box>
      <Text c="dark" size="xs" ps="lg" pt="md" pb="xs">Chats history</Text>
      <ChatHistoryList />
    </Stack>
  );
}); 