import { IsString, IsOptional, IsEnum, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BillingInterval } from '../../../../generated/prisma';

export class CreateSubscriptionProductDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  productPriceId?: string;
}

export class CreateSubscriptionDto {
  @IsString()
  userId: string;

  @IsEnum(BillingInterval)
  interval: BillingInterval;

  @IsOptional()
  @IsString()
  status?: string = 'active';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubscriptionProductDto)
  products: CreateSubscriptionProductDto[];
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class SubscriptionFilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(BillingInterval)
  interval?: BillingInterval;
}