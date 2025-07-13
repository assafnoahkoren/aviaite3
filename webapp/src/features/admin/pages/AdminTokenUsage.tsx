import { useState } from 'react';
import { Stack, Tabs, Select, Paper, Text, Group, Badge, Table, ActionIcon, Button } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconRefresh, IconDownload } from '@tabler/icons-react';
import { 
  useQ_getDailyTokenUsage, 
  useQ_getModelUsageBreakdown,
  useQ_getAllTokenUsage,
  formatCost,
  formatTokens
} from '../../../api/token-usage-api';
import styles from './AdminTokenUsage.module.scss';

export function AdminTokenUsage() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedDays, setSelectedDays] = useState(30);
  const [selectedOrg] = useState<string | null>(null);

  // Queries
  const { data: dailyUsage, isLoading: dailyLoading, refetch: refetchDaily } = useQ_getDailyTokenUsage(selectedDays, selectedOrg || undefined);
  const { data: modelBreakdown, isLoading: modelLoading, refetch: refetchModel } = useQ_getModelUsageBreakdown(
    dateRange[0]?.toISOString().split('T')[0],
    dateRange[1]?.toISOString().split('T')[0],
    selectedOrg || undefined
  );
  const { data: allUsage, isLoading: allLoading, refetch: refetchAll } = useQ_getAllTokenUsage({
    startDate: dateRange[0]?.toISOString().split('T')[0],
    endDate: dateRange[1]?.toISOString().split('T')[0],
    organizationId: selectedOrg || undefined,
    limit: 10
  });

  const handleRefreshAll = () => {
    refetchDaily();
    refetchModel();
    refetchAll();
  };

  // Calculate totals from daily usage
  const totals = dailyUsage?.reduce((acc, day) => ({
    tokens: acc.tokens + day.totalTokens,
    cost: acc.cost + day.totalCostCents
  }), { tokens: 0, cost: 0 }) || { tokens: 0, cost: 0 };

  return (
    <div className={styles.container}>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Text size="xl" fw={600}>Token Usage Analytics</Text>
            <Text c="dimmed" size="sm">Monitor AI token consumption and costs</Text>
          </div>
          <Group>
            <ActionIcon variant="light" onClick={handleRefreshAll} loading={dailyLoading || modelLoading || allLoading}>
              <IconRefresh size={18} />
            </ActionIcon>
            <Button leftSection={<IconDownload size={16} />} variant="light">
              Export Data
            </Button>
          </Group>
        </Group>

        {/* Filters */}
        <Paper p="md" withBorder>
          <Group>
            <Select
              label="Time Period"
              value={String(selectedDays)}
              onChange={(value) => setSelectedDays(Number(value))}
              data={[
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 90 days' },
              ]}
              style={{ width: 150 }}
            />
            <DatePickerInput
              type="range"
              label="Custom Date Range"
              placeholder="Select dates"
              value={dateRange}
              onChange={setDateRange}
              clearable
              style={{ width: 300 }}
            />
          </Group>
        </Paper>

        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          <Paper p="lg" withBorder>
            <Text size="sm" c="dimmed" fw={500}>Total Tokens</Text>
            <Text size="xl" fw={700} mt="xs">{formatTokens(totals.tokens)}</Text>
            <Text size="xs" c="dimmed" mt={4}>
              Last {selectedDays} days
            </Text>
          </Paper>
          
          <Paper p="lg" withBorder>
            <Text size="sm" c="dimmed" fw={500}>Total Cost</Text>
            <Text size="xl" fw={700} mt="xs">{formatCost(totals.cost)}</Text>
            <Text size="xs" c="dimmed" mt={4}>
              Last {selectedDays} days
            </Text>
          </Paper>

          <Paper p="lg" withBorder>
            <Text size="sm" c="dimmed" fw={500}>Avg Daily Tokens</Text>
            <Text size="xl" fw={700} mt="xs">
              {formatTokens(Math.round(totals.tokens / selectedDays))}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              Per day average
            </Text>
          </Paper>

          <Paper p="lg" withBorder>
            <Text size="sm" c="dimmed" fw={500}>Avg Daily Cost</Text>
            <Text size="xl" fw={700} mt="xs">
              {formatCost(Math.round(totals.cost / selectedDays))}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              Per day average
            </Text>
          </Paper>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="daily" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="daily">Daily Trends</Tabs.Tab>
            <Tabs.Tab value="models">Model Breakdown</Tabs.Tab>
            <Tabs.Tab value="records">Usage Records</Tabs.Tab>
          </Tabs.List>

          {/* Daily Trends Tab */}
          <Tabs.Panel value="daily" pt="lg">
            {dailyLoading ? (
              <Text ta="center" c="dimmed">Loading daily usage...</Text>
            ) : dailyUsage && dailyUsage.length > 0 ? (
              <Paper p="lg" withBorder>
                <Text fw={600} mb="md">Token Usage Trend</Text>
                <div className={styles.chartContainer}>
                  {/* Simple bar chart visualization */}
                  <div className={styles.barChart}>
                    {dailyUsage.map((day) => {
                      const maxTokens = Math.max(...dailyUsage.map(d => d.totalTokens));
                      const height = (day.totalTokens / maxTokens) * 100;
                      return (
                        <div key={day.date} className={styles.barWrapper}>
                          <div className={styles.barContainer}>
                            <div 
                              className={styles.bar} 
                              style={{ height: `${height}%` }}
                              title={`${formatTokens(day.totalTokens)} tokens`}
                            />
                          </div>
                          <Text size="xs" c="dimmed" className={styles.barLabel}>
                            {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                          </Text>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Paper>
            ) : (
              <Text ta="center" c="dimmed">No usage data available</Text>
            )}
          </Tabs.Panel>

          {/* Model Breakdown Tab */}
          <Tabs.Panel value="models" pt="lg">
            {modelLoading ? (
              <Text ta="center" c="dimmed">Loading model breakdown...</Text>
            ) : modelBreakdown && modelBreakdown.length > 0 ? (
              <Paper p="lg" withBorder>
                <Text fw={600} mb="md">Usage by Model</Text>
                <Table highlightOnHover>
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Input Tokens</th>
                      <th>Output Tokens</th>
                      <th>Total Tokens</th>
                      <th>Total Cost</th>
                      <th>Requests</th>
                      <th>Avg/Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelBreakdown.map((model) => (
                      <tr key={model.model}>
                        <td>
                          <Badge variant="light">{model.model}</Badge>
                        </td>
                        <td>{formatTokens(model.inputTokens)}</td>
                        <td>{formatTokens(model.outputTokens)}</td>
                        <td>{formatTokens(model.totalTokens)}</td>
                        <td>
                          <Text fw={600}>{formatCost(model.totalCostCents)}</Text>
                        </td>
                        <td>{formatTokens(model.requestCount)}</td>
                        <td>{formatTokens(model.averageTokensPerRequest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Paper>
            ) : (
              <Text ta="center" c="dimmed">No model usage data available</Text>
            )}
          </Tabs.Panel>

          {/* Usage Records Tab */}
          <Tabs.Panel value="records" pt="lg">
            {allLoading ? (
              <Text ta="center" c="dimmed">Loading usage records...</Text>
            ) : allUsage && allUsage.records.length > 0 ? (
              <Paper p="lg" withBorder>
                <Text fw={600} mb="md">Recent Usage Records</Text>
                <Table highlightOnHover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User</th>
                      <th>Organization</th>
                      <th>Model</th>
                      <th>Type</th>
                      <th>Tokens</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsage.records.map((record) => (
                      <tr key={record.id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.User?.email || 'Unknown'}</td>
                        <td>{record.User?.Organization?.name || '-'}</td>
                        <td>
                          <Badge size="sm" variant="light">{record.modelUsed}</Badge>
                        </td>
                        <td>
                          <Badge 
                            size="sm" 
                            color={record.tokenType === 'input' ? 'blue' : 'green'}
                          >
                            {record.tokenType}
                          </Badge>
                        </td>
                        <td>{formatTokens(record.tokensUsed)}</td>
                        <td>{formatCost(record.costInCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Group justify="center" mt="md">
                  <Text size="sm" c="dimmed">
                    Showing {allUsage.records.length} of {allUsage.pagination.total} records
                  </Text>
                </Group>
              </Paper>
            ) : (
              <Text ta="center" c="dimmed">No usage records available</Text>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </div>
  );
}