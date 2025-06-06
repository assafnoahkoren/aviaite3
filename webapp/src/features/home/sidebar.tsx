import cx from 'clsx';
import { useState, useEffect } from 'react';
import styles from './sidebar.module.scss';
import { Button, Group, Menu, Stack, Text, Select } from '@mantine/core';
import { IconLogout, IconUserCircle } from '@tabler/icons-react';
import { useStore_ChatHistory } from '../chat-history/chat-history-store';
import { useStore_Auth } from '../auth/auth-store';
import { observer } from 'mobx-react-lite';
import { useStore_Chat } from '../chat/chat-store';
import { useQ_listAssistants } from '../../api/chat-api';

type Props = {
  onClose?: () => void;
  className?: string;
};

const Sidebar = observer(({ onClose, className }: Props) => {
  const chatHistory = useStore_ChatHistory();
  const chatStore = useStore_Chat();
  const auth = useStore_Auth();
  const chats = chatHistory.chatsQuery.data ?? [];
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const isCreating = chatHistory.createChatMutation.isLoading;

  // Assistant selection state
  const { data: assistants = [], isLoading: loadingAssistants } = useQ_listAssistants();
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);

  // Set default assistant if available
  if (!selectedAssistantId && assistants.length > 0) {
    setSelectedAssistantId(assistants[0].id);
  }

  useEffect(() => {
    if (chatHistory.chatsQuery.isSuccess && !chatStore.currentChatId && chats.length > 0) {
      const sortedChats = [...chats].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      chatStore.setCurrentChatId(sortedChats[0].id);
    }
  }, [chatHistory.chatsQuery.isSuccess, chats, chatStore]);

  const handleNewChat = () => {
    if (!selectedAssistantId) return;
    // For demo, use assistantId as both assistantId and profileId
    chatHistory.createChatMutation
      .mutateAsync({
        assistantId: selectedAssistantId,
        profileId: selectedAssistantId,
      })
      .then((newChat) => {
        chatStore.setCurrentChatId(newChat.id);
        onClose?.();
      });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={cx(styles.sidebar, className)}>
      {/* Top: New Chat button */}
      <Button fullWidth onClick={handleNewChat} variant="light" loading={isCreating} disabled={isCreating || !selectedAssistantId} mb={8}>
        {isCreating ? 'Creating...' : 'New Chat'}
      </Button>
      <Select
        data={assistants.map(a => ({ value: a.id, label: a.label || a.name }))}
        value={selectedAssistantId}
        onChange={setSelectedAssistantId}
        placeholder={loadingAssistants ? 'Loading assistants...' : 'Pick an assistant'}
        disabled={loadingAssistants || assistants.length === 0}
        mb={12}
      />

      {/* Chats list */}
      <div className={styles.chatsList}>
        {chats.length === 0 && <div className={styles.empty}>No chats yet</div>}
        {chats.map((chat) => (
          <Button
            key={chat.id}
            variant={chatStore.currentChatId === chat.id ? 'light' : 'subtle'}
            color={chatStore.currentChatId === chat.id ? 'blue' : 'dark'}
            fullWidth
            justify='flex-start'
            h="max-content"
            py={8}
            mih="max-content"
            onClick={() => {
              chatStore.setCurrentChatId(chat.id);
              onClose?.();
            }}
            style={chatStore.currentChatId === chat.id ? { fontWeight: 600 } : {}}
          >
            <Stack gap={4} align="flex-start">
              <Text key={chat.id} className={styles.chatItem}>
                New Chat
              </Text>
              <Text size="xs" c="dimmed">{formatDate(chat.createdAt)} - {assistants.find(a => a.id === chat.assistantId)?.label || chat.assistantId}</Text>
            </Stack>
          </Button>
        ))}
      </div>

      {/* Bottom: User info and menu */}
      <div className={styles.userArea}>
        <Menu
          opened={userMenuOpened}
          onChange={setUserMenuOpened}
          position="top"
          width={180}
          withinPortal
        >
          {/* @ts-ignore */}
          <Menu.Target>
            <Button
              className={styles.userInfo}
              onClick={() => setUserMenuOpened((o) => !o)}
              tabIndex={0}
              variant="subtle"
              color="gray"
              w="100%"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Group gap={8} align="center">
                <IconUserCircle size={22} />
                <Text className={styles.userEmail} title={auth.user?.email || ''}>
                  {auth.user?.fullName || ''}
                </Text>
              </Group>
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => auth.logout()}>
              <Group gap={4} align="center">
                <IconLogout size={16} color="red" />
                <Text size="sm" c="red">Logout</Text>
              </Group>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
});

export default Sidebar; 