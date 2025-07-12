import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { BillingInterval } from '../../../../generated/prisma';

export class CreateProductPriceDto {
  @IsEnum(BillingInterval)
  interval: BillingInterval;

  @IsNumber()
  priceCents: number;

  @IsString()
  currency: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean = true;

  @IsOptional()
  @IsNumber()
  baseTokensPerMonth?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductPriceDto)
  prices: CreateProductPriceDto[];
}