import { useState } from 'react';
import { Stack, Paper, Text, Group, LoadingOverlay, Table, Badge, ScrollArea, Tabs } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useQ_getDailyQuestionsByCategory } from '../organization-statistics-api';
import type { StatisticsComponentProps } from '../types';

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

export function DailyQuestionsByCategoryChart({ organizationId, startDate, endDate }: StatisticsComponentProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Fetch daily questions by category data
  const { data: categoryData, isLoading } = useQ_getDailyQuestionsByCategory({
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="xs" shadow="sm" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
          <Text size="sm" fw={500}>{label}</Text>
          {payload.map((entry: any, index: number) => (
            <Text key={index} size="sm" style={{ color: entry.color || entry.fill }}>
              {formatCategoryName(entry.dataKey || entry.name)}: {entry.value}
            </Text>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Prepare data for stacked bar chart
  const chartData = categoryData?.data
    .filter(day => day.totalQuestions > 0)
    .map((day, index) => {
      const dayData: any = {
        date: formatDate(day.date),
        fullDate: day.date,
        dayIndex: index,
      };
      
      // Add each category as a property
      day.categories.forEach(cat => {
        dayData[cat.category] = cat.count;
      });
      
      return dayData;
    }) || [];

  // Get all unique categories for the legend
  const allCategories = new Set<string>();
  categoryData?.data.forEach(day => {
    day.categories.forEach(cat => allCategories.add(cat.category));
  });

  // Prepare data for pie chart
  const pieData = categoryData?.categoryTotals.map(cat => ({
    name: formatCategoryName(cat.category),
    value: cat.totalCount,
    percentage: cat.percentage,
  })) || [];

  const selectedDayData = selectedDay !== null && categoryData?.data
    ? categoryData.data.filter(d => d.totalQuestions > 0)[selectedDay]
    : null;

  return (
    <>
      <Paper p="md" shadow="xs" pos="relative">
        <LoadingOverlay visible={isLoading} />
        
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>Daily Questions by Category</Text>
            {categoryData && (
              <Text size="sm" c="dimmed">
                {new Date(categoryData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(categoryData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            )}
          </Group>

          <Tabs defaultValue="timeline">
            <Tabs.List>
              <Tabs.Tab value="timeline">Timeline View</Tabs.Tab>
              <Tabs.Tab value="distribution">Overall Distribution</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="timeline" pt="md">
              {categoryData && chartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      onClick={(data) => {
                        if (data && data.activeTooltipIndex !== undefined) {
                          setSelectedDay(data.activeTooltipIndex);
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

                  {selectedDayData && (
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text fw={600}>
                          Category Breakdown - {formatFullDate(selectedDayData.date)}
                        </Text>
                        <Badge variant="light">
                          {selectedDayData.totalQuestions} total questions
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
                            {selectedDayData.categories.map((cat) => (
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
                  )}
                </>
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  No categorized questions found in the selected period
                </Text>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="distribution" pt="md">
              <Group align="flex-start">
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.percentage}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => {
                          const category = categoryData?.categoryTotals[index]?.category;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={category ? CATEGORY_COLORS[category] || '#868e96' : '#868e96'} 
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <ScrollArea h={400} style={{ flex: 1 }}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Category</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Total Questions</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Percentage</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {categoryData?.categoryTotals.map((cat) => (
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
                            <Badge variant="light">{cat.totalCount}</Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Text fw={500}>{cat.percentage}%</Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Group>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Paper>
    </>
  );
}