import { useState } from 'react';
import { Stack, Text, Group, Paper, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getAdminOrganizations } from '../../../api/admin-api';
import { DailyUniqueUsersChart } from '../../organization-statistics/components/DailyUniqueUsersChart';
import { DailyQuestionsPerUserChart } from '../../organization-statistics/components/DailyQuestionsPerUserChart';
import { DailyUsageTrendChart } from '../../organization-statistics/components/DailyUsageTrendChart';
import { AverageQuestionsChart } from '../../organization-statistics/components/AverageQuestionsChart';
import { DailyQuestionsByCategoryChart } from '../../organization-statistics/components/DailyQuestionsByCategoryChart';

export function AdminOrganizationStatistics() {
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setMonth(today.getMonth() - 1);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([monthAgo, today]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(undefined);

  // Fetch organizations for the selector
  const { data: organizationsData } = useQuery({
    queryKey: ['admin-organizations', { page: 1, limit: 100 }],
    queryFn: () => getAdminOrganizations({ page: 1, limit: 100 }),
  });

  const organizationOptions = [
    { value: '', label: 'All Organizations' },
    ...(organizationsData?.data.map(org => ({
      value: org.id,
      label: org.name,
    })) || []),
  ];

  // Convert dates to ISO string format for API
  const startDateStr = dateRange[0] instanceof Date
    ? dateRange[0].toISOString().split('T')[0]
    : dateRange[0]
      ? new Date(dateRange[0]).toISOString().split('T')[0]
      : '';

  const endDateStr = dateRange[1] instanceof Date
    ? dateRange[1].toISOString().split('T')[0]
    : dateRange[1]
      ? new Date(dateRange[1]).toISOString().split('T')[0]
      : '';


  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Stack gap="xs">
          <Text size="xl" fw={600}>Organization Statistics</Text>
          <Text size="sm" c="dimmed">Monitor user activity and engagement metrics</Text>
        </Stack>
      </Group>

      <Paper p="md" shadow="xs" bg="gray.0">
        <Group align="flex-end">
          <DatePickerInput
            type="range"
            label="Date Range"
            placeholder="Select date range"
            value={dateRange}
            onChange={(value) => {
              setDateRange(value as [Date | null, Date | null]);
            }}
            leftSection={<IconCalendar size={16} />}
            maxDate={today}
            style={{ flex: 1, maxWidth: 350 }}
          />

          <Select
            label="Organization"
            placeholder="Select organization"
            data={organizationOptions}
            value={selectedOrgId || ''}
            onChange={(value) => setSelectedOrgId(value || undefined)}
            style={{ flex: 1, maxWidth: 300 }}
            searchable
          />
        </Group>
      </Paper>

      {/* Render all charts when we have valid dates */}
      {startDateStr && endDateStr && (
        <>
          <AverageQuestionsChart
            organizationId={selectedOrgId}
            startDate={startDateStr}
            endDate={endDateStr}
          />

          <DailyUniqueUsersChart
            organizationId={selectedOrgId}
            startDate={startDateStr}
            endDate={endDateStr}
          />

          <DailyQuestionsPerUserChart
            organizationId={selectedOrgId}
            startDate={startDateStr}
            endDate={endDateStr}
          />

          <DailyUsageTrendChart
            organizationId={selectedOrgId}
            startDate={startDateStr}
            endDate={endDateStr}
          />

          <DailyQuestionsByCategoryChart
            organizationId={selectedOrgId}
            startDate={startDateStr}
            endDate={endDateStr}
          />
        </>
      )}
    </Stack>
  );
}