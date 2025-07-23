import { useState, useEffect } from 'react';
import { Group, Select, Button, Paper, MultiSelect } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import { ChatsOrderBy, type GetChatsByFilterDto } from '../../../api/chat-api';
import { getAdminUsers, type AdminUser } from '../../../api/admin-api';
import { useQuery } from '@tanstack/react-query';

interface ThreadsFilterBarProps {
  onFiltersChange: (filters: GetChatsByFilterDto) => void;
}

export function ThreadsFilterBar({ onFiltersChange }: ThreadsFilterBarProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [orderBy, setOrderBy] = useState<ChatsOrderBy>(ChatsOrderBy.CREATED_AT_DESC);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Fetch users for the multi-select
  const { data: usersResponse } = useQuery({
    queryKey: ['admin', 'users', 'all'],
    queryFn: () => getAdminUsers({ limit: 1000 }), // Get all users
  });

  // Prepare user data for multi-select
  const userData = usersResponse?.data.map((user: AdminUser) => ({
    value: user.id,
    label: `${user.email} (${user.fullName || 'No name'})`
  })) || [];

  // Emit filters whenever they change
  useEffect(() => {
    const filters: GetChatsByFilterDto = {
      filter: {
        userIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
        fromCreatedAt: dateRange[0]?.toISOString(),
        toCreatedAt: dateRange[1]?.toISOString(),
      },
      orderBy,
      pagination: {
        page,
        limit,
      },
    };

    // Remove empty filter object if no filters are set
    if (!filters.filter?.userIds && !filters.filter?.fromCreatedAt && !filters.filter?.toCreatedAt) {
      delete filters.filter;
    }

    onFiltersChange(filters);
  }, [selectedUserIds, dateRange, orderBy, page, limit, onFiltersChange]);

  const handleReset = () => {
    setSelectedUserIds([]);
    setDateRange([null, null]);
    setOrderBy(ChatsOrderBy.CREATED_AT_DESC);
    setPage(1);
    setLimit(20);
  };

  return (
    <Paper p="md" withBorder mb="md">
      <Group>
        <MultiSelect
          label="Filter by Users"
          placeholder="Select users..."
          data={userData}
          value={selectedUserIds}
          onChange={setSelectedUserIds}
          searchable
          clearable
          style={{ minWidth: 300 }}
          leftSection={<IconSearch size={16} />}
        />

        <DatePickerInput
          type="range"
          label="Date Range"
          placeholder="Pick date range"
          value={dateRange}
          onChange={(value) => setDateRange(value as [Date | null, Date | null])}
          clearable
          style={{ minWidth: 250 }}
        />

        <Select
          label="Sort By"
          value={orderBy}
          onChange={(value) => setOrderBy(value as ChatsOrderBy)}
          data={[
            { value: ChatsOrderBy.CREATED_AT_DESC, label: 'Newest First' },
            { value: ChatsOrderBy.CREATED_AT_ASC, label: 'Oldest First' },
            { value: ChatsOrderBy.MESSAGE_COUNT_DESC, label: 'Most Messages' },
            { value: ChatsOrderBy.MESSAGE_COUNT_ASC, label: 'Least Messages' },
          ]}
          style={{ minWidth: 150 }}
        />

        <Select
          label="Items per page"
          value={String(limit)}
          onChange={(value) => {
            setLimit(Number(value));
            setPage(1); // Reset to first page when changing limit
          }}
          data={[
            { value: '10', label: '10' },
            { value: '20', label: '20' },
            { value: '50', label: '50' },
            { value: '100', label: '100' },
          ]}
          style={{ width: 100 }}
        />

        <Button
          variant="light"
          onClick={handleReset}
          leftSection={<IconFilter size={16} />}
          style={{ marginTop: 24 }}
        >
          Reset Filters
        </Button>
      </Group>
    </Paper>
  );
}