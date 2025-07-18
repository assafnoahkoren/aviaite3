import { useState } from 'react';
import { Stack, Paper, Text, Group, LoadingOverlay, Table, Badge, ScrollArea } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQ_getWeeklyQuestionsByCategory } from '../organization-statistics-api';
import type { WeeklyStatisticsComponentProps } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  WARNINGS_ALERTS: '#e03131',
  LIMITATIONS: '#f08c00',
  OTHER: '#868e96',
  SYSTEM_OPERATIONS: '#1971c2',
  FLIGHT_CONTROLS: '#2f9e44',
  AUTOPILOT_FMC: '#7950f2',
  PROCEDURES: '#e64980',
};

const formatCategoryName = (category: string): string => {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export function WeeklyQuestionsByCategoryChart({ organizationId, startDate }: WeeklyStatisticsComponentProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(3); // Default to most recent week

  // Fetch weekly questions by category data
  const { data: categoryData, isLoading } = useQ_getWeeklyQuestionsByCategory({
    organizationId,
    startDate,
  });

  const formatWeekDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="xs" shadow="sm" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
          <Text size="sm" fw={500}>{label}</Text>
          {payload.map((entry: any, index: number) => (
            <Text key={index} size="sm" c={entry.color}>
              {formatCategoryName(entry.dataKey)}: {entry.value}
            </Text>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Prepare data for stacked bar chart
  const chartData = categoryData?.data.map((week, index) => {
    const weekData: any = {
      week: `Week ${index + 1}`,
      fullDate: week.week,
      weekIndex: index,
    };
    
    // Add each category as a property
    week.categories.forEach(cat => {
      weekData[cat.category] = cat.count;
    });
    
    return weekData;
  }) || [];

  // Get all unique categories for the legend
  const allCategories = new Set<string>();
  categoryData?.data.forEach(week => {
    week.categories.forEach(cat => allCategories.add(cat.category));
  });

  const TrendIcon = ({ trend }: { trend: number }) => {
    if (trend > 0) return <IconTrendingUp size={16} color="var(--mantine-color-green-6)" />;
    if (trend < 0) return <IconTrendingDown size={16} color="var(--mantine-color-red-6)" />;
    return null;
  };

  return (
    <>
      <Paper p="md" shadow="xs" pos="relative">
        <LoadingOverlay visible={isLoading} />
        
        <Stack gap="md">
          <Text fw={600}>Weekly Questions by Category (4 weeks)</Text>

          {categoryData && chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  onClick={(data) => {
                    if (data && data.activeLabel) {
                      const weekIndex = chartData.find((d: any) => d.week === data.activeLabel)?.weekIndex;
                      if (weekIndex !== undefined) {
                        setSelectedWeek(weekIndex);
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value) => formatCategoryName(value)}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  
                  {Array.from(allCategories).map((category) => (
                    <Bar 
                      key={category}
                      dataKey={category} 
                      stackId="a" 
                      fill={CATEGORY_COLORS[category] || '#868e96'}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={600}>
                    Category Breakdown - {formatWeekDate(categoryData.data[selectedWeek]?.week || '')}
                  </Text>
                  <Badge variant="light">
                    {categoryData.data[selectedWeek]?.totalQuestions || 0} total questions
                  </Badge>
                </Group>
                
                <ScrollArea h={200}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Category</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Questions</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Percentage</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {categoryData.data[selectedWeek]?.categories.map((cat) => (
                        <Table.Tr key={cat.category}>
                          <Table.Td>
                            <Group gap="xs">
                              <div 
                                style={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: 2,
                                  backgroundColor: CATEGORY_COLORS[cat.category] || '#868e96'
                                }} 
                              />
                              {formatCategoryName(cat.category)}
                            </Group>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Badge variant="light">{cat.count}</Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            {cat.percentage}%
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Stack>

              <Stack gap="xs">
                <Text fw={600}>Category Trends (Week 3 vs Week 4)</Text>
                <ScrollArea h={200}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Category</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Previous Week</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Current Week</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Change</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {categoryData.categoryTrends.map((trend) => (
                        <Table.Tr key={trend.category}>
                          <Table.Td>
                            <Group gap="xs">
                              <div 
                                style={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: 2,
                                  backgroundColor: CATEGORY_COLORS[trend.category] || '#868e96'
                                }} 
                              />
                              {formatCategoryName(trend.category)}
                            </Group>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            {trend.previousWeekCount}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            {trend.currentWeekCount}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Group gap="xs" justify="flex-end">
                              <Text 
                                size="sm" 
                                c={trend.trendPercentage > 0 ? 'green.6' : trend.trendPercentage < 0 ? 'red.6' : 'gray.6'}
                                fw={500}
                              >
                                {trend.trendPercentage > 0 ? '+' : ''}{trend.trendPercentage}%
                              </Text>
                              <TrendIcon trend={trend.trendPercentage} />
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Stack>
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