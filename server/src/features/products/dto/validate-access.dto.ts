import { IsString, IsOptional } from 'class-validator';

export class ValidateAccessDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  assistantId?: string;
}

export class ValidationResponseDto {
  hasAccess: boolean;
  reason?: string;
  subscription?: {
    id: string;
    status: string;
    interval: string;
    startedAt: Date;
    endsAt?: Date;
    products: Array<{
      id: string;
      name: string;
    }>;
  };
  usage?: {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
  };
}