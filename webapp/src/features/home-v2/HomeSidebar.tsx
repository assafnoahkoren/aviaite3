import { Box, Button, Group, LoadingOverlay, Stack, Text, Badge, ActionIcon } from '@mantine/core';
import { ChatHistoryList } from './ChatHistoryList';
import { IconPencilPlus, IconRobot, IconSettings } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { useStore_ChatHistory } from '../chat-history/chat-history-store';
import { useStore_Chat } from '../chat/chat-store';
import { useStore_Auth } from '../auth/auth-store';
import { useStore_Settings } from '../settings/settings-store';

export const HomeSidebar = observer(() => {
  const chatHistoryStore = useStore_ChatHistory();
  const chatStore = useStore_Chat();
  const auth = useStore_Auth();
  const settingsStore = useStore_Settings();

  const currentAssistant = settingsStore.currentAssistant;

  const handleNewChat = () => {
    if (!currentAssistant || !auth.user) return;
    chatHistoryStore.createChatMutation
      .mutateAsync({
        assistantId: currentAssistant.id,
        // TODO: This should be the profile id
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
          !chatHistoryStore.chatsQuery.data?.length &&
          (chatHistoryStore.createChatMutation.isLoading ||
            chatHistoryStore.chatsQuery.isLoading)
        }
      />
      <Box p="md" pb="0">
        <Button
          fullWidth
          variant="outline"
          rightSection={<IconPencilPlus size={16} />}
          onClick={handleNewChat}
          loading={chatHistoryStore.createChatMutation.isLoading}
          disabled={!currentAssistant || chatHistoryStore.createChatMutation.isLoading}
        >
          New Chat
        </Button>
      </Box>
      <Group p="md" justify="center">
        <Group gap="xs" align="center" justify='center' w="max-content">
          <Badge variant="light" size="lg" style={{ flexGrow: 1 }}>
            <Group gap="xs">
              <IconRobot size={16} />
              <Text inherit component="span" size="sm" fw={500}>
                {currentAssistant?.label || currentAssistant?.name || '...'}
              </Text>
            </Group>
          </Badge>
          <ActionIcon variant="subtle" onClick={settingsStore.openSwitchAssistantModal}>
            <IconSettings size={18} />
          </ActionIcon>
        </Group>
      </Group>
      <Text c="dark" size="xs" ps="lg" pt="md" pb="xs">
        Chats history
      </Text>
      <ChatHistoryList />
    </Stack>
  );
}); 