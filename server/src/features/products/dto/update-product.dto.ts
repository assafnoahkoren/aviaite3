import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsNumber()
  baseTokensPerMonth?: number;
}

export class UpdateProductPriceDto {
  @IsOptional()
  @IsNumber()
  priceCents?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}