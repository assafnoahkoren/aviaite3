import { IsString, IsOptional, IsInt, IsEnum, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { BillingInterval } from '../../../../generated/prisma';

export class CreateProductPriceDto {
  @IsEnum(BillingInterval)
  interval: BillingInterval;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsString()
  currency: string = 'USD';
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductPriceDto)
  prices: CreateProductPriceDto[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProductPriceDto {
  @IsInt()
  @Min(0)
  priceCents: number;

  @IsOptional()
  @IsString()
  currency?: string;
}