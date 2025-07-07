import { useState, useMemo } from 'react';
import { IconPlus, IconCopy, IconCheck, IconTrash } from '@tabler/icons-react';
import { Button, ActionIcon, Tooltip } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { MobxQuery, MobxMutation } from '../../../infra/mobx-query';
import { adminRegistrationTokensApi, type RegistrationToken, type TokensResponse } from '../../../api/admin-registration-tokens';
import styles from './AdminRegistrationPermits.module.scss';

export const AdminRegistrationPermits = observer(() => {
  const [page, setPage] = useState(1);
  const [generateModalOpened, setGenerateModalOpened] = useState(false);
  const [resultModalOpened, setResultModalOpened] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const tokensQuery = useMemo(
    () => new MobxQuery<TokensResponse, unknown, [string, number, number]>({
      queryKey: ['admin-registration-tokens', page, 10],
      queryFn: () => adminRegistrationTokensApi.getTokens(page, 10).then(res => res.data),
    }),
    [page]
  );

  const generateTokenMutation = useMemo(
    () => new MobxMutation({
      mutationFn: async (tokenLabel?: string) => {
        const response = await adminRegistrationTokensApi.generateToken(tokenLabel);
        setGeneratedUrl(response.data.registrationUrl);
        setGenerateModalOpened(false);
        setResultModalOpened(true);
        setLabel('');
        return response.data;
      },
      onSuccess: () => {
        tokensQuery.refetch();
      },
    }),
    [tokensQuery]
  );

  const deleteTokenMutation = useMemo(
    () => new MobxMutation({
      mutationFn: async (tokenId: string) => {
        await adminRegistrationTokensApi.deleteToken(tokenId);
      },
      onSuccess: () => {
        tokensQuery.refetch();
      },
    }),
    [tokensQuery]
  );

  const handleGenerateToken = () => {
    setGenerateModalOpened(true);
  };

  const handleConfirmGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateTokenMutation.mutate(label || undefined);
  };

  const handleDelete = (tokenId: string) => {
    if (window.confirm('Are you sure you want to delete this registration token?')) {
      deleteTokenMutation.mutate(tokenId);
    }
  };

  const handleCopy = async (url: string, tokenId: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedTokenId(tokenId);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  if (tokensQuery.isLoading) return <div className={styles.loading}>Loading registration permits...</div>;
  if (tokensQuery.isError) return <div className={styles.error}>Failed to load registration permits</div>;
  
  const data = tokensQuery.data;
  if (!data) return null;

  return (
    <div className={styles.registrationPermits}>
      <div className={styles.header}>
        <h1>Registration Permits</h1>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleGenerateToken}
        >
          Generate New Token
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Token</th>
              <th>Created</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Used By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className={styles.emptyState}>
                    No registration tokens found
                  </div>
                </td>
              </tr>
            ) : (
              data.data.map((token: RegistrationToken) => (
                <tr key={token.id}>
                  <td>
                    {token.label || <span className={styles.noLabel}>No label</span>}
                  </td>
                  <td>
                    <div className={styles.tokenGroup}>
                      <span className={styles.token}>{token.token}</span>
                      <Tooltip label={copiedTokenId === token.id ? 'Copied!' : 'Copy registration link'}>
                        <ActionIcon
                          variant="subtle"
                          color={copiedTokenId === token.id ? 'teal' : 'gray'}
                          onClick={() => handleCopy(token.registrationUrl, token.id)}
                        >
                          {copiedTokenId === token.id ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    </div>
                  </td>
                  <td>{new Date(token.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(token.expiresAt).toLocaleDateString()}</td>
                  <td>
                    {token.isUsed ? (
                      <span className={`${styles.badge} ${styles.badgeUsed}`}>Used</span>
                    ) : token.isExpired ? (
                      <span className={`${styles.badge} ${styles.badgeExpired}`}>Expired</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                    )}
                  </td>
                  <td>
                    {token.usedByUser ? (
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{token.usedByUser.fullName || 'N/A'}</div>
                        <div className={styles.userEmail}>{token.usedByUser.email}</div>
                      </div>
                    ) : (
                      <span className={styles.emptyUser}>-</span>
                    )}
                  </td>
                  <td>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => handleDelete(token.id)}
                      disabled={token.isUsed}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={styles.pageButton}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {data.totalPages}
          </span>
          <button
            disabled={page === data.totalPages}
            onClick={() => setPage(page + 1)}
            className={styles.pageButton}
          >
            Next
          </button>
        </div>
      )}

      {/* Generate Token Modal */}
      {generateModalOpened && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Generate Registration Token</h2>
            <form onSubmit={handleConfirmGenerate}>
              <div className={styles.formGroup}>
                <label>Label (optional)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., John Doe - Marketing Team"
                  autoFocus
                />
                <div className={styles.inputDescription}>
                  Add a note to remember who this token is for
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={generateTokenMutation.isLoading}
                >
                  Generate Token
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setGenerateModalOpened(false);
                    setLabel('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModalOpened && (
        <div className={styles.modal}>
          <div className={`${styles.modalContent} ${styles.resultModal}`}>
            <h2>Registration Link Generated</h2>
            <p>Share this link with the user who needs to register:</p>
            <div className={styles.linkContainer}>
              <div className={styles.link}>{generatedUrl}</div>
              <button
                className={`${styles.copyButtonLarge} ${copiedTokenId === 'result' ? styles.copied : ''}`}
                onClick={async () => {
                  if (generatedUrl) {
                    await navigator.clipboard.writeText(generatedUrl);
                    setCopiedTokenId('result');
                    setTimeout(() => setCopiedTokenId(null), 2000);
                  }
                }}
              >
                {copiedTokenId === 'result' ? (
                  <>
                    <IconCheck size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <IconCopy size={16} />
                    Copy Link
                  </>
                )}
              </button>
            </div>
            <p className={styles.info}>
              This link will expire in 7 days and can only be used once.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.saveButton}
                onClick={() => {
                  setResultModalOpened(false);
                  setGeneratedUrl(null);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});