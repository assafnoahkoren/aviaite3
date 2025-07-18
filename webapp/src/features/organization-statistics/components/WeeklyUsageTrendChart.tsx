import { Stack, Paper, Text, Group, LoadingOverlay } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQ_getWeeklyUsageTrend } from '../organization-statistics-api';
import type { WeeklyStatisticsComponentProps } from '../types';

export function WeeklyUsageTrendChart({ organizationId, startDate }: WeeklyStatisticsComponentProps) {
  // Fetch weekly usage trend data
  const { data: trendData, isLoading } = useQ_getWeeklyUsageTrend({
    organizationId,
    startDate,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="xs" shadow="sm" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
          <Text size="sm" fw={500}>{label}</Text>
          <Text size="sm" c="blue.6">
            Messages: {payload[0].value}
          </Text>
          <Text size="sm" c="green.6">
            Users: {payload[1].value}
          </Text>
        </Paper>
      );
    }
    return null;
  };

  const trendColor = (trendData?.trendPercentage || 0) >= 0 ? 'green' : 'red';
  const TrendIcon = (trendData?.trendPercentage || 0) >= 0 ? IconTrendingUp : IconTrendingDown;

  return (
    <>
      <Paper p="md" shadow="xs">
        <Stack gap="md">
          <Text fw={600}>Weekly Usage Overview</Text>
          
          <Group gap="xl">
            <Paper p="md" radius="md" bg="blue.0" style={{ flex: 1 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Total Messages</Text>
                <Text size="xl" fw={700}>{trendData?.totalMessages || 0}</Text>
              </Stack>
            </Paper>
            
            <Paper p="md" radius="md" bg="green.0" style={{ flex: 1 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Unique Users</Text>
                <Text size="xl" fw={700}>{trendData?.totalUniqueUsers || 0}</Text>
              </Stack>
            </Paper>
            
            <Paper p="md" radius="md" bg={`${trendColor}.0`} style={{ flex: 1 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Week-over-Week Change</Text>
                <Group gap="xs" align="center">
                  <Text size="xl" fw={700} c={`${trendColor}.6`}>
                    {Math.abs(trendData?.trendPercentage || 0)}%
                  </Text>
                  <TrendIcon size={20} color={`var(--mantine-color-${trendColor}-6)`} />
                </Group>
              </Stack>
            </Paper>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" shadow="xs" pos="relative">
        <LoadingOverlay visible={isLoading} />
        
        <Stack gap="md">
          <Text fw={600}>Weekly Usage Trend</Text>

          {trendData && trendData.dataPoints.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={trendData.dataPoints.map(point => ({
                  date: formatDate(point.date),
                  messages: point.messageCount,
                  users: point.userCount,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#228be6"
                  strokeWidth={2}
                  dot={{ fill: '#228be6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Messages"
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#40c057"
                  strokeWidth={2}
                  dot={{ fill: '#40c057', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Unique Users"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              No data available for the selected week
            </Text>
          )}
        </Stack>
      </Paper>
    </>
  );
}