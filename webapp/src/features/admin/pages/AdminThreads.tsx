import { useState, useCallback } from 'react';
import { Container, Title, Paper, Table, Text, Badge, Group, Button, Stack, Pagination, Center, Loader, Alert, Modal } from '@mantine/core';
import { IconMessageCircle, IconUser, IconCalendar, IconExternalLink } from '@tabler/icons-react';
import { format } from 'date-fns';
import { ThreadsFilterBar } from '../components/ThreadsFilterBar';
import { StaticMessageList } from '../components/StaticMessageList';
import { useQ_getChatsByFilter, type GetChatsByFilterDto, type ThreadWithCount } from '../../../api/chat-api';
import { useQ_listAssistants } from '../../../api/chat-api';
import { useNavigate } from 'react-router-dom';

export function AdminThreads() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<GetChatsByFilterDto>({
    pagination: { page: 1, limit: 20 }
  });
  const [selectedThread, setSelectedThread] = useState<ThreadWithCount | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  // Fetch threads with current filters
  const { data: threadsData, isLoading, error } = useQ_getChatsByFilter(filters);
  const { data: assistants = [] } = useQ_listAssistants();

  // Get assistant label by ID
  const getAssistantLabel = (assistantId: string) => {
    const assistant = assistants.find(a => a.id === assistantId);
    return assistant?.label || 'Unknown Assistant';
  };

  const handleFiltersChange = useCallback((newFilters: GetChatsByFilterDto) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getBadgeColor = (messageCount: number) => {
    if (messageCount === 0) return 'gray';
    if (messageCount < 5) return 'blue';
    if (messageCount < 20) return 'green';
    return 'violet';
  };

  const handleViewMessages = (thread: ThreadWithCount) => {
    setSelectedThread(thread);
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setSelectedThread(null);
  };

  return (
    <Container size="xl" py="xl">
      <Stack>
        <Title order={2}>Chat Threads Management</Title>
        
        <ThreadsFilterBar onFiltersChange={handleFiltersChange} />

        <Paper shadow="xs" p="md" withBorder>
          {isLoading && (
            <Center py="xl">
              <Loader size="lg" />
            </Center>
          )}

          {error && (
            <Alert color="red" title="Error loading threads">
              {error.message || 'An error occurred while loading threads'}
            </Alert>
          )}

          {!isLoading && !error && threadsData && (
            <>
              <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">
                  Showing {threadsData.data.length} of {threadsData.total} threads
                </Text>
                <Text size="sm" c="dimmed">
                  Page {threadsData.page} of {threadsData.totalPages}
                </Text>
              </Group>

              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Thread Name</Table.Th>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Assistant</Table.Th>
                    <Table.Th>Messages</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Last Updated</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {threadsData.data.map((thread: ThreadWithCount) => (
                    <Table.Tr key={thread.id}>
                      <Table.Td>
                        <Text fw={500} truncate style={{ maxWidth: 200 }}>
                          {thread.name || 'Unnamed Thread'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconUser size={14} />
                          <Text size="sm" truncate style={{ maxWidth: 200 }}>
                            {thread.User?.fullName || thread.User?.email || thread.userId}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue">
                          {getAssistantLabel(thread.assistantId)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          variant="filled" 
                          color={getBadgeColor(thread._count?.Messages || 0)}
                          leftSection={<IconMessageCircle size={12} />}
                        >
                          {thread._count?.Messages || 0}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconCalendar size={14} />
                          <Text size="sm">{formatDate(thread.createdAt)}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(thread.updatedAt)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          variant="subtle"
                          size="xs"
                          leftSection={<IconExternalLink size={14} />}
                          onClick={() => handleViewMessages(thread)}
                        >
                          View
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {threadsData.data.length === 0 && (
                <Center py="xl">
                  <Text c="dimmed">No threads found with the current filters</Text>
                </Center>
              )}

              {threadsData.totalPages > 1 && (
                <Center mt="xl">
                  <Pagination
                    value={threadsData.page}
                    onChange={handlePageChange}
                    total={threadsData.totalPages}
                  />
                </Center>
              )}
            </>
          )}
        </Paper>
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        size="xl"
        title={
          <Group>
            <Text fw={600}>Thread Messages</Text>
            {selectedThread && (
              <Badge variant="light" color="blue">
                {getAssistantLabel(selectedThread.assistantId)}
              </Badge>
            )}
          </Group>
        }
      >
        {selectedThread && (
          <StaticMessageList threadId={selectedThread.id} />
        )}
      </Modal>
    </Container>
  );
}