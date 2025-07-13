import { api } from './index';

// Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  type: 'subscription' | 'addon';
  baseTokensPerMonth?: number;
  isActive: boolean;
  features?: string[];
  productPrices: ProductPrice[];
}

export interface ProductPrice {
  id: string;
  productId: string;
  interval: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  status: 'active' | 'cancelled' | 'past_due';
  interval: 'monthly' | 'yearly';
  startedAt: string;
  endsAt?: string;
  products: Array<{
    id: string;
    name: string;
  }>;
  usage?: {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
  };
}

export interface PurchaseSubscriptionDto {
  productIds: string[];
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardholderName: string;
  billingAddress?: string;
}

export interface PurchaseResponseDto {
  subscriptionId: string;
  status: 'success' | 'failed';
  message: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  totalAmount: number;
  nextBillingDate: string;
}

// API functions
export async function getProducts(): Promise<Product[]> {
  const res = await api.get('/api/products');
  
  // Transform data if backend hasn't applied transformation
  return res.data.map((product: any) => ({
    ...product,
    // Add type field if missing
    type: product.type || (product.isRecurring ? 'subscription' : 'addon'),
    // Add isActive field if missing
    isActive: product.isActive !== undefined ? product.isActive : product.deletedAt === null,
    // Transform prices to productPrices if needed
    productPrices: product.productPrices || product.prices?.map((price: any) => ({
      ...price,
      amount: price.amount || price.priceCents,
      isActive: price.isActive !== undefined ? price.isActive : price.deletedAt === null,
    })) || [],
  }));
}

export async function getUserSubscriptions(): Promise<Subscription[]> {
  const res = await api.get('/api/products/subscriptions');
  return res.data;
}

export async function getActiveSubscription(): Promise<Subscription | null> {
  const res = await api.get('/api/products/subscriptions/active');
  return res.data;
}

export async function purchaseSubscription(dto: PurchaseSubscriptionDto): Promise<PurchaseResponseDto> {
  const res = await api.post('/api/products/subscriptions/purchase', dto);
  return res.data;
}

export async function cancelSubscription(subscriptionId: string): Promise<Subscription> {
  const res = await api.post(`/api/products/subscriptions/${subscriptionId}/cancel`);
  return res.data;
}

export async function getTokenUsage(): Promise<{
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
}> {
  const res = await api.get('/api/products/subscriptions/usage');
  return res.data;
}