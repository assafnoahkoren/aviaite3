import { IsString, IsEnum, IsArray, ValidateNested, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { BillingInterval } from '../../../../generated/prisma';

export class SubscriptionProductDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  productPriceId?: string;
}

export class CreateSubscriptionDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsEnum(BillingInterval)
  interval: BillingInterval;

  @IsOptional()
  @IsString()
  status?: string = 'active';

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionProductDto)
  products: SubscriptionProductDto[];
}