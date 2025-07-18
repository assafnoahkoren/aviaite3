export interface StatisticsFilters {
  organizationId?: string;
  dateRange: [Date | null, Date | null];
  weekStartDate: Date | null;
}

export interface StatisticsComponentProps {
  organizationId?: string;
  startDate: string;
  endDate: string;
}

export interface WeeklyStatisticsComponentProps {
  organizationId?: string;
  startDate: string;
}