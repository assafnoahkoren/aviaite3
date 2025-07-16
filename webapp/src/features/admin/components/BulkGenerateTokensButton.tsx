import { useState, useMemo } from 'react';
import { IconFileStack, IconCopy, IconCheck } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { MobxMutation } from '../../../infra/mobx-query';
import { adminRegistrationTokensApi, type GenerateTokenResponse } from '../../../api/admin-registration-tokens';
import styles from '../pages/AdminRegistrationPermits.module.scss';

interface BulkGenerateTokensButtonProps {
  onSuccess: () => void;
}

export const BulkGenerateTokensButton = observer(({ onSuccess }: BulkGenerateTokensButtonProps) => {
  const [bulkGenerateModalOpened, setBulkGenerateModalOpened] = useState(false);
  const [bulkResultModalOpened, setBulkResultModalOpened] = useState(false);
  const [bulkLabel, setBulkLabel] = useState('');
  const [bulkAmount, setBulkAmount] = useState(5);
  const [bulkGeneratedUrls, setBulkGeneratedUrls] = useState<GenerateTokenResponse[]>([]);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const bulkGenerateTokenMutation = useMemo(
    () => new MobxMutation({
      mutationFn: async ({ prefix, amount }: { prefix: string; amount: number }) => {
        const promises = Array.from({ length: amount }, (_, index) => {
          const labelWithIndex = prefix ? `${prefix} ${index + 1}` : undefined;
          return adminRegistrationTokensApi.generateToken(labelWithIndex).then(res => res.data);
        });
        
        const results = await Promise.all(promises);
        setBulkGeneratedUrls(results);
        setBulkGenerateModalOpened(false);
        setBulkResultModalOpened(true);
        setBulkLabel('');
        setBulkAmount(5);
        return results;
      },
      onSuccess: () => {
        onSuccess();
      },
    }),
    [onSuccess]
  );

  const handleBulkGenerate = () => {
    setBulkGenerateModalOpened(true);
  };

  const handleConfirmBulkGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkAmount > 0 && bulkAmount <= 100) {
      bulkGenerateTokenMutation.mutate({ prefix: bulkLabel, amount: bulkAmount });
    }
  };

  const handleCopyUrl = async (url: string, tokenId: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedTokenId(tokenId);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleCopyAllUrls = async () => {
    const allUrls = bulkGeneratedUrls.map(token => token.registrationUrl).join('\n');
    await navigator.clipboard.writeText(allUrls);
    setCopiedTokenId('bulk-all');
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  return (
    <>
      <Button
        leftSection={<IconFileStack size={16} />}
        onClick={handleBulkGenerate}
        variant="light"
      >
        Generate Bulk
      </Button>

      {/* Bulk Generate Modal */}
      {bulkGenerateModalOpened && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Generate Multiple Registration Tokens</h2>
            <form onSubmit={handleConfirmBulkGenerate}>
              <div className={styles.formGroup}>
                <label>Label Prefix (optional)</label>
                <input
                  type="text"
                  value={bulkLabel}
                  onChange={(e) => setBulkLabel(e.target.value)}
                  placeholder="e.g., Training Group"
                  autoFocus
                />
                <div className={styles.inputDescription}>
                  Each token will be labeled as "{bulkLabel || 'Token'} 1", "{bulkLabel || 'Token'} 2", etc.
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Number of Tokens</label>
                <input
                  type="number"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={100}
                  required
                />
                <div className={styles.inputDescription}>
                  Generate between 1 and 100 tokens at once
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={bulkGenerateTokenMutation.isLoading || bulkAmount < 1 || bulkAmount > 100}
                >
                  {bulkGenerateTokenMutation.isLoading ? 'Generating...' : `Generate ${bulkAmount} Tokens`}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setBulkGenerateModalOpened(false);
                    setBulkLabel('');
                    setBulkAmount(5);
                  }}
                  disabled={bulkGenerateTokenMutation.isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Result Modal */}
      {bulkResultModalOpened && (
        <div className={styles.modal}>
          <div className={`${styles.modalContent} ${styles.resultModal}`} style={{ maxWidth: '600px' }}>
            <h2>{bulkGeneratedUrls.length} Registration Links Generated</h2>
            <p>Share these links with users who need to register:</p>
            
            <div className={styles.bulkLinksContainer} style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
              {bulkGeneratedUrls.map((token) => (
                <div key={token.id} className={styles.bulkLinkItem} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong>{token.label || 'No label'}</strong>
                    <button
                      className={`${styles.copyButton} ${copiedTokenId === token.id ? styles.copied : ''}`}
                      onClick={() => handleCopyUrl(token.registrationUrl, token.id)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      {copiedTokenId === token.id ? (
                        <>
                          <IconCheck size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <IconCopy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                    {token.registrationUrl}
                  </div>
                </div>
              ))}
            </div>

            <button
              className={`${styles.copyButtonLarge} ${copiedTokenId === 'bulk-all' ? styles.copied : ''}`}
              onClick={handleCopyAllUrls}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              {copiedTokenId === 'bulk-all' ? (
                <>
                  <IconCheck size={16} />
                  All Links Copied!
                </>
              ) : (
                <>
                  <IconCopy size={16} />
                  Copy All Links
                </>
              )}
            </button>

            <p className={styles.info}>
              These links will expire in 7 days and can only be used once each.
            </p>
            
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.saveButton}
                onClick={() => {
                  setBulkResultModalOpened(false);
                  setBulkGeneratedUrls([]);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});