export interface DailyUniqueUsersResult {
  date: Date;
  uniqueUsers: number;
}

export interface DailyUniqueUsersRangeResult {
  startDate: Date;
  endDate: Date;
  data: DailyUniqueUsersResult[];
}