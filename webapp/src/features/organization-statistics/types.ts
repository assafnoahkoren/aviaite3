export interface StatisticsFilters {
  organizationId?: string;
  dateRange: [Date | null, Date | null];
}

export interface StatisticsComponentProps {
  organizationId?: string;
  startDate: string;
  endDate: string;
}