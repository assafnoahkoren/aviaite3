import { useState } from 'react';
import { Stack, Text, Group, Paper, Select, SegmentedControl } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getAdminOrganizations } from '../../../api/admin-api';
import { DailyUniqueUsersChart } from '../../organization-statistics/components/DailyUniqueUsersChart';
import { DailyQuestionsPerUserChart } from '../../organization-statistics/components/DailyQuestionsPerUserChart';
import { WeeklyUsageTrendChart } from '../../organization-statistics/components/WeeklyUsageTrendChart';
import { AverageQuestionsChart } from '../../organization-statistics/components/AverageQuestionsChart';
import { WeeklyQuestionsByCategoryChart } from '../../organization-statistics/components/WeeklyQuestionsByCategoryChart';

export function AdminOrganizationStatistics() {
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setMonth(today.getMonth() - 1);
  
  // Start of current week (Monday)
  const currentWeekStart = new Date(today);
  const day = currentWeekStart.getDay();
  const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1);
  currentWeekStart.setDate(diff);
  currentWeekStart.setHours(0, 0, 0, 0);
  
  const [dateMode, setDateMode] = useState<'range' | 'week'>('range');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([monthAgo, today]);
  const [weekStartDate, setWeekStartDate] = useState<Date | null>(currentWeekStart);
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
  const startDateStr = dateMode === 'range' 
    ? (dateRange[0] instanceof Date 
        ? dateRange[0].toISOString().split('T')[0]
        : dateRange[0] 
        ? new Date(dateRange[0]).toISOString().split('T')[0] 
        : '')
    : (weekStartDate instanceof Date 
        ? weekStartDate.toISOString().split('T')[0]
        : weekStartDate 
        ? new Date(weekStartDate).toISOString().split('T')[0] 
        : '');
    
  const endDateStr = dateMode === 'range'
    ? (dateRange[1] instanceof Date 
        ? dateRange[1].toISOString().split('T')[0]
        : dateRange[1] 
        ? new Date(dateRange[1]).toISOString().split('T')[0] 
        : '')
    : ''; // Weekly components calculate their own end date

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
          <SegmentedControl
            value={dateMode}
            onChange={(value) => setDateMode(value as 'range' | 'week')}
            data={[
              { label: 'Date Range', value: 'range' },
              { label: 'Week Starting', value: 'week' },
            ]}
          />
          
          {dateMode === 'range' ? (
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
          ) : (
            <DatePickerInput
              label="Week Starting"
              placeholder="Select week start"
              value={weekStartDate}
              onChange={(value) => setWeekStartDate(value)}
              leftSection={<IconCalendar size={16} />}
              maxDate={today}
              style={{ flex: 1, maxWidth: 350 }}
              getDayProps={(date) => {
                // Only allow Mondays to be selected
                if (date instanceof Date && date.getDay() !== 1) {
                  return { disabled: true };
                }
                return {};
              }}
            />
          )}
          
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

      {/* Date range based statistics */}
      {dateMode === 'range' && startDateStr && endDateStr && (
        <>
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
          
          <AverageQuestionsChart 
            organizationId={selectedOrgId}
            startDate={startDateStr}
            endDate={endDateStr}
          />
        </>
      )}
      
      {/* Weekly statistics */}
      {dateMode === 'week' && startDateStr && (
        <>
          <WeeklyUsageTrendChart 
            organizationId={selectedOrgId}
            startDate={startDateStr}
          />
          
          <WeeklyQuestionsByCategoryChart 
            organizationId={selectedOrgId}
            startDate={startDateStr}
          />
        </>
      )}
    </Stack>
  );
}