import { IsOptional, IsArray, IsString, IsDateString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatsOrderBy } from '../chat.types';

export class ChatsFilterDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsDateString()
  fromCreatedAt?: string;

  @IsOptional()
  @IsDateString()
  toCreatedAt?: string;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class GetChatsByFilterDto {
  @IsOptional()
  @Type(() => ChatsFilterDto)
  filter?: ChatsFilterDto;

  @IsOptional()
  @IsEnum(ChatsOrderBy)
  orderBy?: ChatsOrderBy;

  @IsOptional()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;
}