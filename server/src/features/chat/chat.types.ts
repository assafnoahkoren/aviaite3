export interface ChatsFilter {
  userIds?: string[];
  fromCreatedAt?: Date;
  toCreatedAt?: Date;
}

export enum ChatsOrderBy {
  CREATED_AT_ASC = 'createdAt_asc',
  CREATED_AT_DESC = 'createdAt_desc',
  MESSAGE_COUNT_ASC = 'messageCount_asc',
  MESSAGE_COUNT_DESC = 'messageCount_desc',
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface GetChatsByFilterOptions {
  filter?: ChatsFilter;
  orderBy?: ChatsOrderBy;
  pagination?: PaginationOptions;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}