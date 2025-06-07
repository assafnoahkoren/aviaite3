import { Box, Button, Stack, Text } from '@mantine/core';
import { ChatHistoryList } from './ChatHistoryList';
import { IconPencilPlus } from '@tabler/icons-react';

export function HomeSidebar() {
  return (
    <Stack style={{ height: '100%' }} gap="0">
      <Box p="md" pb="0">
        <Button fullWidth variant="outline" rightSection={<IconPencilPlus size={16} />}>
          New Chat
        </Button>
      </Box>
      <Text c="dark" size="xs" ps="lg" pt="md" pb="xs">Chats history</Text>
      <ChatHistoryList />
    </Stack>
  );
} 