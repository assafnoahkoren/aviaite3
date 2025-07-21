import { useState } from 'react';
import { Stack, Text, Group, Paper, Select, Button, Badge } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconDownload } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getAdminOrganizations } from '../../../api/admin-api';
import { usePDF } from 'react-to-pdf';
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // PDF generation setup
  const { toPDF, targetRef } = usePDF({ 
    filename: `organization-statistics-${new Date().toISOString().split('T')[0]}.pdf`,
    page: { 
      margin: 20,
      format: 'a4',
      orientation: 'portrait'
    }
  });

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    await toPDF();
    setIsGeneratingPDF(false);
  };

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

  // Get selected organization name for PDF
  const selectedOrgName = selectedOrgId 
    ? organizationsData?.data.find(org => org.id === selectedOrgId)?.name || 'Unknown'
    : 'All Organizations';

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Stack gap="xs">
          <Text size="xl" fw={600}>Organization Statistics</Text>
          <Text size="sm" c="dimmed">Monitor user activity and engagement metrics</Text>
        </Stack>
        <Button 
          leftSection={<IconDownload size={16} />}
          onClick={handleDownloadPDF}
          loading={isGeneratingPDF}
          variant="light"
        >
          Download PDF
        </Button>
      </Group>

      <Paper p="md" shadow="xs" bg="gray.0">
        <Group align="flex-end">
          <DatePickerInput
            type="range"
            label="Date Range"
            placeholder="Select date range or single day"
            value={dateRange}
            onChange={(value) => {
              setDateRange(value as [Date | null, Date | null]);
            }}
            leftSection={<IconCalendar size={16} />}
            maxDate={today}
            style={{ flex: 1, maxWidth: 350 }}
            allowSingleDateInRange
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
        <div ref={targetRef}>
          <Stack gap="lg">
            {/* PDF Header - visible when generating PDF */}
            {isGeneratingPDF && (
              <Paper p="lg" mb="lg" style={{ pageBreakAfter: 'avoid', borderBottom: '2px solid #e9ecef' }}>
                <Stack gap="md">
                  <Text size="xxl" fw={700} style={{ fontSize: '28px' }}>Organization Statistics Report</Text>
                  
                  <Paper bg="blue.0" p="md" radius="md">
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Date Range</Text>
                        <Text size="lg" fw={700} c="blue.7">
                          {new Date(startDateStr).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} - {new Date(endDateStr).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </div>
                      {startDateStr === endDateStr && (
                        <Badge size="lg" variant="light" color="blue">
                          Single Day Report
                        </Badge>
                      )}
                    </Group>
                  </Paper>
                  
                  <Group gap="xl">
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Organization</Text>
                      <Text size="md" fw={600}>{selectedOrgName}</Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Generated</Text>
                      <Text size="md" fw={600}>
                        {new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total Days</Text>
                      <Text size="md" fw={600}>
                        {Math.ceil((new Date(endDateStr).getTime() - new Date(startDateStr).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Paper>
            )}

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
          </Stack>
        </div>
      )}
    </Stack>
  );
}