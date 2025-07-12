import { IsOptional, IsString, IsDateString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TokenType } from '../../../../generated/prisma';

export class TokenUsageQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  modelUsed?: string;

  @IsOptional()
  @IsEnum(TokenType)
  tokenType?: TokenType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value) || 50)
  limit?: number = 50;
}

export class DailyUsageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => parseInt(value) || 30)
  days?: number = 30;

  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class UserUsageParamsDto {
  @IsString()
  userId: string;
}

export class OrganizationUsageParamsDto {
  @IsString()
  organizationId: string;
}