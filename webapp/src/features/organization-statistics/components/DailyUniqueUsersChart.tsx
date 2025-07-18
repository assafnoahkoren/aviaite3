import { useState } from 'react';
import { Stack, Paper, Text, Group, Select, LoadingOverlay } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { useQ_getDailyUniqueUsers } from '../organization-statistics-api';
import { getAdminOrganizations } from '../../../api/admin-api';
import { useQuery } from '@tanstack/react-query';

export function DailyUniqueUsersChart() {
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

  // Fetch daily unique users data
  const { data: dailyUsersData, isLoading } = useQ_getDailyUniqueUsers({
    organizationId: selectedOrgId,
    startDate: startDateStr,
    endDate: endDateStr,
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentValue = payload[0].value;
      const dataIndex = payload[0].payload.index;
      const previousValue = dataIndex > 0 ? dailyUsersData?.data[dataIndex - 1].uniqueUsers : null;
      const change = previousValue ? currentValue - previousValue : 0;
      const changePercent = previousValue && previousValue > 0 
        ? ((change / previousValue) * 100).toFixed(1) 
        : '0';

      return (
        <Paper p="xs" shadow="sm" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
          <Text size="sm" fw={500}>{label}</Text>
          <Text size="sm" c="blue.6">
            Users: {currentValue}
          </Text>
          {previousValue && (
            <Text size="sm" c={change >= 0 ? 'green.6' : 'red.6'}>
              {change >= 0 ? '+' : ''}{change} ({changePercent}%)
            </Text>
          )}
        </Paper>
      );
    }
    return null;
  };

  const totalUniqueUsers = dailyUsersData?.data.reduce((sum, day) => sum + day.uniqueUsers, 0) || 0;
  const averageUsers = dailyUsersData?.data.length 
    ? Math.round(totalUniqueUsers / dailyUsersData.data.length) 
    : 0;

  return (
    <>
      <Paper p="md" shadow="xs">
        <Stack gap="md">
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
          <Text fw={600}>Daily Unique Users Trend</Text>

          {dailyUsersData && dailyUsersData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={dailyUsersData.data.map((day, index) => ({
                  date: formatDate(day.date),
                  uniqueUsers: day.uniqueUsers,
                  index: index,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="uniqueUsers" 
                  stroke="#228be6"
                  strokeWidth={2}
                  name="Unique Users"
                  dot={{ fill: '#228be6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              No data available for the selected period
            </Text>
          )}
        </Stack>
      </Paper>
    </>
  );
}