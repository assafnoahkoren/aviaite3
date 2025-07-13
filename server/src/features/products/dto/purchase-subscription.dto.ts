import { IsString, IsNotEmpty, IsOptional, Matches, IsUUID, IsArray, ArrayNotEmpty } from 'class-validator';

export class PurchaseSubscriptionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  productIds: string[];

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\/\d{2}$/, { message: 'Expiry must be in MM/YY format' })
  cardExpiry: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3,4}$/, { message: 'CVV must be 3 or 4 digits' })
  cardCvv: string;

  @IsString()
  @IsNotEmpty()
  cardholderName: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;
}

export class PurchaseResponseDto {
  subscriptionId: string;
  status: 'success' | 'failed';
  message: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  totalAmount: number;
  nextBillingDate: Date;
}