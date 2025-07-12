import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { BillingInterval } from '../../../../generated/prisma';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsEnum(BillingInterval)
  interval?: BillingInterval;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}