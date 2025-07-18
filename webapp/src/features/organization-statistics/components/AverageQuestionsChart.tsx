import { Stack, Paper, Text, LoadingOverlay, SimpleGrid, Group } from '@mantine/core';
import { IconTrendingUp, IconUsers, IconCalendarStats, IconCalendar } from '@tabler/icons-react';
import { useQ_getAverageQuestionsPerUser } from '../organization-statistics-api';
import type { StatisticsComponentProps } from '../types';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export function AverageQuestionsChart({ organizationId, startDate, endDate }: StatisticsComponentProps) {
  // Fetch average questions data
  const { data: averageData, isLoading } = useQ_getAverageQuestionsPerUser({
    organizationId,
    startDate,
    endDate,
  });

  const statCards: StatCard[] = [
    {
      title: 'Total Questions',
      value: averageData?.totalQuestions || 0,
      icon: <IconTrendingUp size={20} />,
      color: 'blue',
    },
    {
      title: 'Total Users',
      value: averageData?.totalUsers || 0,
      icon: <IconUsers size={20} />,
      color: 'green',
    },
    {
      title: 'Avg Questions/User/Day',
      value: averageData?.averageQuestionsPerUserPerDay || 0,
      icon: <IconCalendarStats size={20} />,
      color: 'violet',
    },
    {
      title: 'Avg Questions/User',
      value: averageData?.averageQuestionsPerUser || 0,
      icon: <IconUsers size={20} />,
      color: 'orange',
    },
    {
      title: 'Avg Questions/Day',
      value: averageData?.averageQuestionsPerDay || 0,
      icon: <IconCalendar size={20} />,
      color: 'cyan',
    },
    {
      title: 'Total Days',
      value: averageData?.totalDays || 0,
      icon: <IconCalendarStats size={20} />,
      color: 'gray',
    },
  ];

  return (
    <Paper p="md" shadow="xs" pos="relative">
      <LoadingOverlay visible={isLoading} />
      
      <Stack gap="md">
        <Text fw={600}>Average Questions Statistics</Text>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {statCards.map((card) => (
            <Paper 
              key={card.title} 
              p="md" 
              radius="md" 
              bg={`${card.color}.0`}
              style={{ 
                border: `1px solid var(--mantine-color-${card.color}-2)`,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Group justify="space-between" align="flex-start" mb="xs">
                <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                  {card.title}
                </Text>
                <div style={{ color: `var(--mantine-color-${card.color}-6)` }}>
                  {card.icon}
                </div>
              </Group>
              <Text size="xl" fw={700} c={`${card.color}.6`}>
                {card.value}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}