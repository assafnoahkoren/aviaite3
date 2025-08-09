import { IsOptional, IsEmail, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../../../generated/prisma';
import { PaginationDto } from './pagination.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAccess?: boolean;

  @IsOptional()
  @IsString()
  organizationId?: string | null;
}

export class UserFilterDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAccess?: boolean;

  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class UserQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasAccess?: boolean;

  @IsOptional()
  @IsString()
  organizationId?: string;
}