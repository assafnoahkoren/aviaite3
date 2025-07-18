import { useState } from 'react';
import { Stack, Paper, Text, Group, Select, LoadingOverlay, Table, Badge } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useQ_getDailyUniqueUsers } from '../../organization-statistics/organization-statistics-api';
import { getAdminOrganizations } from '../../../api/admin-api';
import { useQuery } from '@tanstack/react-query';

export function AdminOrganizationStatistics() {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([weekAgo, today]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(undefined);

  // Fetch organizations for the selector
  const { data: organizationsData } = useQuery({
    queryKey: ['admin-organizations', { page: 1, limit: 100 }],
    queryFn: () => getAdminOrganizations({ page: 1, limit: 100 }),
  });

  // Fetch daily unique users data
  const { data: dailyUsersData, isLoading } = useQ_getDailyUniqueUsers({
    organizationId: selectedOrgId,
    startDate: dateRange[0]?.toISOString().split('T')[0] || '',
    endDate: dateRange[1]?.toISOString().split('T')[0] || '',
  });

  const organizationOptions = [
    { value: '', label: 'All Organizations' },
    ...(organizationsData?.data.map(org => ({
      value: org.id,
      label: org.name,
    })) || []),
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalUniqueUsers = dailyUsersData?.data.reduce((sum, day) => sum + day.uniqueUsers, 0) || 0;
  const averageUsers = dailyUsersData?.data.length 
    ? Math.round(totalUniqueUsers / dailyUsersData.data.length) 
    : 0;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Stack gap="xs">
          <Text size="xl" fw={600}>Organization Statistics</Text>
          <Text size="sm" c="dimmed">Monitor user activity and engagement metrics</Text>
        </Stack>
      </Group>

      <Paper p="md" shadow="xs">
        <Stack gap="md">
          <Group align="flex-end">
            <DatePickerInput
              type="range"
              label="Date Range"
              placeholder="Select date range"
              value={dateRange}
              onChange={(value) => setDateRange(value as [Date | null, Date | null])}
              leftSection={<IconCalendar size={16} />}
              maxDate={today}
              style={{ flex: 1, maxWidth: 300 }}
            />
            
            <Select
              label="Organization"
              placeholder="Select organization"
              data={organizationOptions}
              value={selectedOrgId || ''}
              onChange={(value) => setSelectedOrgId(value || undefined)}
              style={{ flex: 1, maxWidth: 250 }}
              searchable
            />
          </Group>

          <Group gap="xl">
            <Paper p="md" radius="md" bg="blue.0" style={{ flex: 1 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Total Unique Users</Text>
                <Text size="xl" fw={700}>{totalUniqueUsers}</Text>
              </Stack>
            </Paper>
            
            <Paper p="md" radius="md" bg="green.0" style={{ flex: 1 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Average Daily Users</Text>
                <Text size="xl" fw={700}>{averageUsers}</Text>
              </Stack>
            </Paper>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" shadow="xs" pos="relative">
        <LoadingOverlay visible={isLoading} />
        
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>Daily Unique Users</Text>
            {dailyUsersData && (
              <Badge variant="light">
                {dailyUsersData.data.length} days
              </Badge>
            )}
          </Group>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Unique Users</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Change</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {dailyUsersData?.data.map((day, index) => {
                const previousDay = index > 0 ? dailyUsersData.data[index - 1] : null;
                const change = previousDay 
                  ? day.uniqueUsers - previousDay.uniqueUsers 
                  : 0;
                const changePercent = previousDay && previousDay.uniqueUsers > 0
                  ? Math.round((change / previousDay.uniqueUsers) * 100)
                  : 0;

                return (
                  <Table.Tr key={day.date}>
                    <Table.Td>{formatDate(day.date)}</Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text fw={500}>{day.uniqueUsers}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      {index > 0 && (
                        <Badge 
                          variant="light" 
                          color={change >= 0 ? 'green' : 'red'}
                        >
                          {change >= 0 ? '+' : ''}{change} ({changePercent}%)
                        </Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
              {(!dailyUsersData || dailyUsersData.data.length === 0) && (
                <Table.Tr>
                  <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                    <Text c="dimmed">No data available for the selected period</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}