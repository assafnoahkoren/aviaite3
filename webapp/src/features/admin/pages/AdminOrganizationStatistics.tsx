import { Stack, Text, Group } from '@mantine/core';
import { DailyUniqueUsersChart } from '../../organization-statistics/components/DailyUniqueUsersChart';

export function AdminOrganizationStatistics() {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Stack gap="xs">
          <Text size="xl" fw={600}>Organization Statistics</Text>
          <Text size="sm" c="dimmed">Monitor user activity and engagement metrics</Text>
        </Stack>
      </Group>

      <DailyUniqueUsersChart />
    </Stack>
  );
}