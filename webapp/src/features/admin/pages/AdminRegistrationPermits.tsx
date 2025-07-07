import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Stack,
  Title,
  TextInput,
  Badge,
  Group,
  Text,
  ActionIcon,
  Pagination,
  Paper,
  Modal,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import { IconPlus, IconTrash, IconCopy, IconCheck } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { MobxQuery, MobxMutation } from '../../../infra/mobx-query';
import { adminRegistrationTokensApi, type RegistrationToken, type TokensResponse } from '../../../api/admin-registration-tokens';
import { useForm } from '@mantine/form';

export const AdminRegistrationPermits = observer(() => {
  const [page, setPage] = useState(1);
  const [generateModalOpened, setGenerateModalOpened] = useState(false);
  const [resultModalOpened, setResultModalOpened] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      label: '',
    },
  });

  const tokensQuery = useMemo(
    () => new MobxQuery<TokensResponse, unknown, [string, number, number]>({
      queryKey: ['admin-registration-tokens', page, 10],
      queryFn: () => adminRegistrationTokensApi.getTokens(page, 10).then(res => res.data),
    }),
    [page]
  );

  const generateTokenMutation = useMemo(
    () => new MobxMutation({
      mutationFn: async (label?: string) => {
        const response = await adminRegistrationTokensApi.generateToken(label);
        setGeneratedUrl(response.data.registrationUrl);
        setGenerateModalOpened(false);
        setResultModalOpened(true);
        form.reset();
        return response.data;
      },
      onSuccess: () => {
        tokensQuery.refetch();
      },
    }),
    [tokensQuery, form]
  );

  const deleteTokenMutation = useMemo(
    () => new MobxMutation({
      mutationFn: async (tokenId: string) => {
        await adminRegistrationTokensApi.deleteToken(tokenId);
      },
      onSuccess: () => {
        // TODO: Add notification when mantine notifications are configured
        tokensQuery.refetch();
      },
    }),
    [tokensQuery]
  );

  const handleGenerateToken = () => {
    setGenerateModalOpened(true);
  };

  const handleConfirmGenerate = () => {
    generateTokenMutation.mutate(form.values.label || undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const tokens = tokensQuery.data?.data || [];
  const totalPages = tokensQuery.data?.totalPages || 1;

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={2}>Registration Permits</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleGenerateToken}
        >
          Generate New Token
        </Button>
      </Group>

      <Paper shadow="sm" radius="md" p="lg" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Label</Table.Th>
              <Table.Th>Token</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Expires</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Used By</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tokensQuery.isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                  Loading...
                </Table.Td>
              </Table.Tr>
            ) : tokens.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                  No registration tokens found
                </Table.Td>
              </Table.Tr>
            ) : (
              tokens.map((token: RegistrationToken) => (
                <Table.Tr key={token.id}>
                  <Table.Td>
                    {token.label || <Text c="dimmed">No label</Text>}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text size="sm" style={{ fontFamily: 'monospace' }}>
                        {token.token}
                      </Text>
                      <CopyButton value={token.registrationUrl}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied!' : 'Copy link'}>
                            <ActionIcon
                              color={copied ? 'teal' : 'gray'}
                              variant="subtle"
                              onClick={copy}
                            >
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  </Table.Td>
                  <Table.Td>{formatDate(token.createdAt)}</Table.Td>
                  <Table.Td>{formatDate(token.expiresAt)}</Table.Td>
                  <Table.Td>
                    {token.isUsed ? (
                      <Badge color="gray">Used</Badge>
                    ) : token.isExpired ? (
                      <Badge color="red">Expired</Badge>
                    ) : (
                      <Badge color="green">Active</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {token.usedByUser ? (
                      <Stack gap={0}>
                        <Text size="sm">{token.usedByUser.fullName || 'N/A'}</Text>
                        <Text size="xs" c="dimmed">
                          {token.usedByUser.email}
                        </Text>
                      </Stack>
                    ) : (
                      <Text c="dimmed">-</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => deleteTokenMutation.mutate(token.id)}
                      disabled={token.isUsed}
                      loading={deleteTokenMutation.isLoading}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>

        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              value={page}
              onChange={setPage}
              total={totalPages}
            />
          </Group>
        )}
      </Paper>

      {/* Generate Token Modal */}
      <Modal
        opened={generateModalOpened}
        onClose={() => {
          setGenerateModalOpened(false);
          form.reset();
        }}
        title="Generate Registration Token"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleConfirmGenerate();
        }}>
          <Stack>
            <TextInput
              label="Label (optional)"
              placeholder="e.g., John Doe - Marketing Team"
              description="Add a note to remember who this token is for"
              {...form.getInputProps('label')}
              data-autofocus
            />
            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={() => {
                  setGenerateModalOpened(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={generateTokenMutation.isLoading}
              >
                Generate Token
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Result Modal */}
      <Modal
        opened={resultModalOpened}
        onClose={() => {
          setResultModalOpened(false);
          setGeneratedUrl(null);
        }}
        title="Registration Link Generated"
        size="lg"
      >
        <Stack>
          <Text>
            Share this link with the user who needs to register:
          </Text>
          <Paper p="md" withBorder>
            <Group justify="space-between">
              <Text size="sm" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {generatedUrl}
              </Text>
              <CopyButton value={generatedUrl || ''}>
                {({ copied, copy }) => (
                  <Button
                    color={copied ? 'teal' : 'blue'}
                    onClick={copy}
                    leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </CopyButton>
            </Group>
          </Paper>
          <Text size="sm" c="dimmed">
            This link will expire in 7 days and can only be used once.
          </Text>
        </Stack>
      </Modal>
    </Stack>
  );
});