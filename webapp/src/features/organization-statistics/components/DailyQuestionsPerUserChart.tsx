import { useState } from 'react';
import { Stack, Paper, Text, Group, LoadingOverlay, Table, Badge, ScrollArea } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQ_getDailyQuestionsPerUser } from '../organization-statistics-api';
import type { StatisticsComponentProps } from '../types';

export function DailyQuestionsPerUserChart({ organizationId, startDate, endDate }: StatisticsComponentProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch daily questions data
  const { data: questionsData, isLoading } = useQ_getDailyQuestionsPerUser({
    organizationId,
    startDate,
    endDate,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get data for selected date or latest date
  const selectedData = questionsData?.data.find(d => d.date === selectedDate) || 
                      questionsData?.data[questionsData.data.length - 1];

  const totalQuestions = questionsData?.data.reduce((sum, day) => sum + day.totalQuestions, 0) || 0;
  const totalDays = questionsData?.data.length || 0;
  const averageQuestionsPerDay = totalDays > 0 ? Math.round(totalQuestions / totalDays) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="xs" shadow="sm" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
          <Text size="sm" fw={500}>{label}</Text>
          <Text size="sm" c="blue.6">
            Questions: {payload[0].value}
          </Text>
        </Paper>
      );
    }
    return null;
  };

  return (
    <>
      <Paper p="md" shadow="xs" pos="relative">
        <LoadingOverlay visible={isLoading} />
        
        <Stack gap="md">
          <Text fw={600}>Daily Questions per User</Text>

          <Group gap="xl">
            <Paper p="md" radius="md" bg="blue.0" style={{ flex: 1 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Total Questions</Text>
                <Text size="xl" fw={700}>{totalQuestions}</Text>
              </Stack>
            </Paper>
            
            <Paper p="md" radius="md" bg="green.0" style={{ flex: 1 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Average Questions/Day</Text>
                <Text size="xl" fw={700}>{averageQuestionsPerDay}</Text>
              </Stack>
            </Paper>
          </Group>

          {questionsData && questionsData.data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={questionsData.data.map(day => ({
                    date: formatDate(day.date),
                    fullDate: day.date,
                    questions: day.totalQuestions,
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                  onClick={(data) => {
                    if (data && data.activePayload) {
                      setSelectedDate(data.activePayload[0].payload.fullDate);
                    }
                  }}
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
                  <Bar 
                    dataKey="questions" 
                    fill="#228be6"
                    name="Questions"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              {selectedData && (
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={600}>
                      User Activity - {formatFullDate(selectedData.date)}
                    </Text>
                    <Badge variant="light">
                      {selectedData.users.length} users
                    </Badge>
                  </Group>
                  
                  <ScrollArea h={300}>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>User</Table.Th>
                          <Table.Th>Email</Table.Th>
                          <Table.Th style={{ textAlign: 'right' }}>Questions</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {selectedData.users.map((user) => (
                          <Table.Tr key={user.userId}>
                            <Table.Td>{user.userName}</Table.Td>
                            <Table.Td>{user.email}</Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                              <Badge variant="light">{user.questionCount}</Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                        {selectedData.users.length === 0 && (
                          <Table.Tr>
                            <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                              <Text c="dimmed">No activity on this day</Text>
                            </Table.Td>
                          </Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Stack>
              )}
            </>
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