import { Progress, Text, Group, Stack, Skeleton } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getTokenUsage } from '../../api/subscriptions-api';

function formatTokenCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1)}M`;
  } else if (count >= 1_000) {
    return `${(count / 1_000).toFixed(count % 1_000 === 0 ? 0 : 1)}K`;
  }
  return count.toString();
}

export function TokenUsage() {
  const { data: usage, isLoading, error } = useQuery({
    queryKey: ['tokenUsage'],
    queryFn: getTokenUsage,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Stack gap="xs" style={{ minWidth: 200 }}>
        <Skeleton height={16} width="60%" />
        <Skeleton height={8} width="100%" />
      </Stack>
    );
  }

  if (error || !usage) {
    return null;
  }

  const isUnlimited = usage.limit >= 10_000_000;
  const percentage = isUnlimited ? 0 : usage.percentUsed;

  return (
    <Stack gap="xs" style={{ minWidth: 200 }}>
      <Group justify="space-between" gap="xs">
        <Text size="sm" c="dimmed">Token Usage</Text>
        <Text size="sm" fw={600}>
          {formatTokenCount(usage.used)} / {formatTokenCount(usage.limit)}
        </Text>
      </Group>
      {!isUnlimited && (
        <Progress 
          value={percentage} 
          size="sm" 
          color={percentage > 90 ? 'red' : percentage > 75 ? 'yellow' : 'cream'}
          radius="xl"
        />
      )}
    </Stack>
  );
}