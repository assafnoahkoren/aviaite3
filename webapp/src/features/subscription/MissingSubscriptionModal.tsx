import { Text, Button, Stack, Badge, Group, Alert, List, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconRocket, IconCheck, IconX } from '@tabler/icons-react';
import { modals } from '@mantine/modals';

interface MissingSubscriptionModalProps {
  error: any;
  onClose?: () => void;
}

export function MissingSubscriptionModal({ error, onClose }: MissingSubscriptionModalProps) {
  const details = error?.response?.data?.details || error?.details || {};
  const message = error?.response?.data?.message || error?.message || 'Subscription required';
  
  const handleViewPlans = () => {
    window.location.href = '/subscription/plans';
    onClose?.();
  };

  const handlePurchaseTokens = () => {
    window.location.href = '/subscription/tokens';
    onClose?.();
  };

  return (
    <Stack gap="md">
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        {message}
      </Alert>

      {details.assistantName && (
        <Stack gap="xs">
          <Text size="sm" c="dimmed">Requested Assistant:</Text>
          <Badge size="lg" variant="outline">
            {details.assistantName}
          </Badge>
        </Stack>
      )}

      {details.requiredAction === 'SUBSCRIBE' && (
        <>
          <Text size="sm">
            To access <strong>{details.assistantName || 'this assistant'}</strong>, you need an active subscription.
          </Text>
          
          {details.suggestedProducts && details.suggestedProducts.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Available plans:</Text>
              <Group gap="xs">
                {details.suggestedProducts.map((product: string) => (
                  <Badge key={product} variant="filled" color="blue">
                    {product.toUpperCase()}
                  </Badge>
                ))}
              </Group>
            </Stack>
          )}

          <Button 
            fullWidth 
            leftSection={<IconRocket size={18} />}
            onClick={handleViewPlans}
          >
            View Subscription Plans
          </Button>
        </>
      )}

      {details.requiredAction === 'UPGRADE' && (
        <>
          <Text size="sm">
            Your current subscription doesn't include access to <strong>{details.assistantName || 'this assistant'}</strong>.
          </Text>

          <Stack gap="sm">
            {details.currentProducts && details.currentProducts.length > 0 && (
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon color="green" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <Text size="sm" c="dimmed" mb={4}>Your current products:</Text>
                {details.currentProducts.map((product: any) => (
                  <List.Item key={product.id}>
                    {product.name.toUpperCase()}
                  </List.Item>
                ))}
              </List>
            )}

            {details.requiredProduct && (
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon color="red" size={20} radius="xl">
                    <IconX size={12} />
                  </ThemeIcon>
                }
              >
                <Text size="sm" c="dimmed" mb={4}>Required product:</Text>
                <List.Item>
                  {details.requiredProduct.toUpperCase()}
                </List.Item>
              </List>
            )}
          </Stack>

          <Button 
            fullWidth 
            leftSection={<IconRocket size={18} />}
            onClick={handleViewPlans}
          >
            Upgrade Subscription
          </Button>
        </>
      )}

      {details.requiredAction === 'PURCHASE_TOKENS' && (
        <>
          <Text size="sm">
            You've used all your tokens for the current period.
          </Text>

          {details.usage && (
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Tokens used:</Text>
                <Text size="sm" fw={600}>
                  {details.usage.used.toLocaleString()} / {details.usage.limit.toLocaleString()}
                </Text>
              </Group>
              
              {details.resetDate && (
                <Text size="xs" c="dimmed">
                  Resets on {new Date(details.resetDate).toLocaleDateString()}
                </Text>
              )}
            </Stack>
          )}

          <Button 
            fullWidth 
            variant="filled"
            onClick={handlePurchaseTokens}
          >
            Purchase Additional Tokens
          </Button>
        </>
      )}
    </Stack>
  );
}

// Helper function to show the modal
export function showMissingSubscriptionModal(error: any) {
  modals.open({
    title: 'Subscription Required',
    children: <MissingSubscriptionModal error={error} onClose={() => modals.closeAll()} />,
    size: 'md',
    centered: true,
  });
}