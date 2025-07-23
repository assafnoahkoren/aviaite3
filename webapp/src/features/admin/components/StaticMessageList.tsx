import { Box, ScrollArea, Stack, Center, Loader, Space, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getAdminThreadMessages, type AdminThreadMessage } from '../../../api/admin-api';
import { UserMessage } from '../../chat-v2/UserMessage';
import { StaticAssistantMessage } from './StaticAssistantMessage';
import classes from '../../chat-v2/MessagesContainer.module.scss';

interface StaticMessageListProps {
  threadId: string;
}

export function StaticMessageList({ threadId }: StaticMessageListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'thread', threadId, 'messages'],
    queryFn: () => getAdminThreadMessages(threadId),
    enabled: !!threadId,
  });

  if (isLoading) {
    return (
      <Box className={classes.root} style={{ minHeight: 400 }}>
        <Center style={{ minHeight: 400 }}>
          <Loader />
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.root} style={{ minHeight: 400 }}>
        <Center style={{ minHeight: 400 }}>
          <Text c="red">Error loading messages: {(error as Error).message}</Text>
        </Center>
      </Box>
    );
  }

  if (!data || data.messages.length === 0) {
    return (
      <Box className={classes.root} style={{ minHeight: 400 }}>
        <Center style={{ minHeight: 400 }}>
          <Text c="dimmed">No messages found in this thread</Text>
        </Center>
      </Box>
    );
  }

  // Transform admin messages to match the format expected by UserMessage and AssistantMessage
  const transformedMessages = data.messages.map((msg: AdminThreadMessage) => ({
    id: msg.id,
    threadId: msg.threadId,
    userId: msg.role === 'user' ? data.thread.userId : 'assistant',
    content: msg.content,
    createdAt: msg.createdAt,
    role: msg.role,
  }));

  return (
    <Box className={classes.root} style={{ height: '600px', maxHeight: '80vh' }}>
      <ScrollArea style={{ height: '100%' }}>
        <Stack gap="lg" p="0">
          <Space h="md" />
          {transformedMessages.map((message) => {
            if (message.role === 'user') {
              return <UserMessage key={message.id} message={message} />;
            }
            if (message.role === 'assistant') {
              return <StaticAssistantMessage key={message.id} message={message} />;
            }
            return null;
          })}
          <Space h="md" />
        </Stack>
      </ScrollArea>
    </Box>
  );
}