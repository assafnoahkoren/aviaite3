import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { Prisma, BillingInterval } from '../../../generated/prisma';
import { CreateSubscriptionDto, UpdateSubscriptionDto, ValidationResponseDto } from './dto';
import { PurchaseSubscriptionDto, PurchaseResponseDto } from './dto/purchase-subscription.dto';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

// Assistant to Product mapping - now maps to product name prefixes
export const ASSISTANT_PRODUCT_MAP: Record<string, string> = {
  'asst_GiwIP1vySr6XctY9w7NvunLw': '737', // Co-Pilot-737-V2
  'asst_StHM7qcEs2TkCFvc89KGBETy': '737', // elal-737
  'asst_fZC1wK2LvYo8a93nqMVgGrnf': '787', // 787-NEW
  'asst_9cw3eNl5AIUH1YAsyDmKgK85': '787', // elal-787
};

@Injectable()
export class SubscriptionsService {
  async getUserSubscriptions(userId: string, includeOrganization = true) {
    const subscriptions = [];
    
    // Get user's personal subscriptions
    const userSubscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        subscriptionProducts: {
          where: { deletedAt: null },
          include: {
            Product: true,
            ProductPrice: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
    subscriptions.push(...userSubscriptions);

    // Get organization subscriptions if requested
    if (includeOrganization) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true },
      });

      if (user?.organizationId) {
        const orgSubscriptions = await prisma.subscription.findMany({
          where: {
            organizationId: user.organizationId,
            deletedAt: null,
          },
          include: {
            subscriptionProducts: {
              where: { deletedAt: null },
              include: {
                Product: true,
                ProductPrice: true,
              },
            },
            Organization: true,
          },
          orderBy: { startedAt: 'desc' },
        });
        subscriptions.push(...orgSubscriptions);
      }
    }

    return subscriptions;
  }

  async getActiveSubscription(userId: string) {
    // First check for personal subscription
    let subscription = await this.findActiveSubscription(userId, null);
    
    // If no personal subscription, check organization
    if (!subscription) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true },
      });
      
      if (user?.organizationId) {
        subscription = await this.findActiveSubscription(null, user.organizationId);
      }
    }

    if (!subscription) {
      return null;
    }

    // Add usage information
    const usage = await this.getCurrentPeriodUsage(userId, subscription.id);
    
    return {
      ...subscription,
      usage,
    };
  }

  private async findActiveSubscription(userId: string | null, organizationId: string | null) {
    return prisma.subscription.findFirst({
      where: {
        ...(userId && { userId }),
        ...(organizationId && { organizationId }),
        status: 'active',
        deletedAt: null,
        OR: [
          { endsAt: null },
          { endsAt: { gte: new Date() } },
        ],
      },
      include: {
        subscriptionProducts: {
          where: { deletedAt: null },
          include: {
            Product: true,
            ProductPrice: true,
          },
        },
        Organization: true,
      },
    });
  }

  async createSubscription(userIdOrOrgId: string, data: CreateSubscriptionDto) {
    const { products, interval, userId, organizationId } = data;
    
    // Determine if this is a user or organization subscription
    const isOrgSubscription = !!organizationId;
    const targetUserId = isOrgSubscription ? null : (userId || userIdOrOrgId);
    const targetOrgId = isOrgSubscription ? organizationId : null;

    // Validate products exist
    const productIds = products.map(p => p.productId);
    const existingProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null,
      },
    });

    if (existingProducts.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // Cancel any existing active subscriptions for the same entity
    if (targetUserId) {
      await prisma.subscription.updateMany({
        where: {
          userId: targetUserId,
          status: 'active',
          deletedAt: null,
        },
        data: {
          status: 'cancelled',
          endsAt: new Date(),
        },
      });
    } else if (targetOrgId) {
      await prisma.subscription.updateMany({
        where: {
          organizationId: targetOrgId,
          status: 'active',
          deletedAt: null,
        },
        data: {
          status: 'cancelled',
          endsAt: new Date(),
        },
      });
    }

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        ...(targetUserId && { userId: targetUserId }),
        ...(targetOrgId && { organizationId: targetOrgId }),
        status: 'active',
        interval,
        startedAt: new Date(),
        entityType: isOrgSubscription ? 'organization' : 'user',
        entityId: targetOrgId || targetUserId || '',
        subscriptionProducts: {
          create: products.map((p) => ({
            productId: p.productId,
            productPriceId: p.productPriceId,
          })),
        },
      },
      include: {
        subscriptionProducts: {
          include: {
            Product: true,
            ProductPrice: true,
          },
        },
        Organization: true,
      },
    });

    return subscription;
  }

  async updateSubscription(subscriptionId: string, userId: string, data: UpdateSubscriptionDto) {
    // Verify subscription belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
        deletedAt: null,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data,
      include: {
        subscriptionProducts: {
          include: {
            Product: true,
            ProductPrice: true,
          },
        },
      },
    });
  }

  async cancelSubscription(subscriptionId: string, userId: string) {
    // Verify subscription belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
        status: 'active',
        deletedAt: null,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    // Set end date to end of current billing period
    const endsAt = this.calculateBillingPeriodEnd(subscription.startedAt, subscription.interval);

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'cancelled',
        endsAt,
      },
    });
  }

  async validateSubscriptionAccess(
    userId: string,
    params: { productId?: string; assistantId?: string },
  ): Promise<ValidationResponseDto> {
    // First check for personal subscription
    let subscription = await this.findActiveSubscriptionForValidation(userId, null);
    
    // If no personal subscription, check organization
    if (!subscription) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true },
      });
      
      if (user?.organizationId) {
        subscription = await this.findActiveSubscriptionForValidation(null, user.organizationId);
      }
    }

    // No active subscription
    if (!subscription) {
      return {
        hasAccess: false,
        reason: 'No active subscription found',
      };
    }

    // Check if subscription includes the requested product
    if (params.productId) {
      const hasProduct = subscription.subscriptionProducts.some(
        (sp) => sp.productId === params.productId,
      );
      
      if (!hasProduct) {
        return {
          hasAccess: false,
          reason: 'Product not included in subscription',
          subscription: this.formatSubscriptionResponse(subscription),
        };
      }
    }

    // Map assistant to product if needed
    if (params.assistantId) {
      const mappedProductName = this.mapAssistantToProduct(params.assistantId);
      if (!mappedProductName) {
        return {
          hasAccess: false,
          reason: 'Unknown assistant',
          subscription: this.formatSubscriptionResponse(subscription),
        };
      }

      // Check if user has any product that starts with the mapped prefix (737 or 787)
      const hasProduct = subscription.subscriptionProducts.some(
        (sp) => sp.Product.name.startsWith(mappedProductName),
      );
      
      if (!hasProduct) {
        return {
          hasAccess: false,
          reason: `No ${mappedProductName} subscription found`,
          subscription: this.formatSubscriptionResponse(subscription),
        };
      }
    }

    // Calculate token usage for current period
    const usage = await this.getCurrentPeriodUsage(userId, subscription.id);
    
    // Check if user has exceeded token limit
    if (usage.remaining <= 0) {
      return {
        hasAccess: false,
        reason: 'Token limit exceeded for current period',
        subscription: this.formatSubscriptionResponse(subscription),
        usage,
      };
    }

    // Access granted
    return {
      hasAccess: true,
      subscription: this.formatSubscriptionResponse(subscription),
      usage,
    };
  }

  async getUserTokenUsage(userId: string) {
    const periodStart = startOfMonth(new Date());
    const periodEnd = endOfMonth(new Date());

    const usage = await prisma.userTokenUsage.aggregate({
      where: {
        userId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      _sum: {
        tokensUsed: true,
      },
    });

    return usage._sum.tokensUsed || 0;
  }

  async getCurrentPeriodUsage(userId: string, subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        subscriptionProducts: {
          include: {
            Product: true,
          },
        },
        Organization: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Calculate current period dates
    const periodStart = startOfMonth(new Date());
    const periodEnd = endOfMonth(new Date());

    // Get token usage based on subscription type
    let usage;
    if (subscription.organizationId) {
      // For organization subscriptions, aggregate all organization users' usage
      usage = await prisma.userTokenUsage.aggregate({
        where: {
          organizationId: subscription.organizationId,
          date: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
        _sum: {
          tokensUsed: true,
        },
      });
    } else {
      // For personal subscriptions, only count the user's usage
      usage = await prisma.userTokenUsage.aggregate({
        where: {
          userId,
          date: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
        _sum: {
          tokensUsed: true,
        },
      });
    }

    const usedTokens = usage._sum.tokensUsed || 0;

    // Use tokensLimit from subscription
    const tokenLimit = subscription.tokensLimit || 0;

    // Check for additional token purchases
    let tokenPurchases;
    if (subscription.organizationId) {
      tokenPurchases = await prisma.tokenPurchase.aggregate({
        where: {
          organizationId: subscription.organizationId,
          createdAt: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
        _sum: {
          tokenAmount: true,
        },
      });
    } else {
      tokenPurchases = await prisma.tokenPurchase.aggregate({
        where: {
          userId,
          createdAt: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
        _sum: {
          tokenAmount: true,
        },
      });
    }

    const additionalTokens = tokenPurchases._sum.tokenAmount || 0;
    const totalLimit = tokenLimit + additionalTokens;
    const remaining = Math.max(0, totalLimit - usedTokens);

    return {
      used: usedTokens,
      limit: totalLimit,
      remaining,
      percentUsed: totalLimit > 0 ? Math.round((usedTokens / totalLimit) * 100) : 0,
    };
  }

  private formatSubscriptionResponse(subscription: {
    id: string;
    status: string;
    interval: BillingInterval;
    startedAt: Date;
    endsAt: Date | null;
    subscriptionProducts: Array<{
      Product: {
        id: string;
        name: string;
      };
    }>;
  }) {
    return {
      id: subscription.id,
      status: subscription.status,
      interval: subscription.interval as string,
      startedAt: subscription.startedAt,
      endsAt: subscription.endsAt || undefined,
      products: subscription.subscriptionProducts.map((sp) => ({
        id: sp.Product.id,
        name: sp.Product.name,
      })),
    };
  }

  private calculateBillingPeriodEnd(startDate: Date, interval: BillingInterval): Date {
    const date = new Date(startDate);
    
    if (interval === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (interval === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    }
    
    return date;
  }

  private async findActiveSubscriptionForValidation(userId: string | null, organizationId: string | null) {
    return prisma.subscription.findFirst({
      where: {
        ...(userId && { userId }),
        ...(organizationId && { organizationId }),
        status: 'active',
        deletedAt: null,
        OR: [
          { endsAt: null },
          { endsAt: { gte: new Date() } },
        ],
      },
      include: {
        subscriptionProducts: {
          where: { deletedAt: null },
          include: {
            Product: true,
          },
        },
      },
    });
  }

  mapAssistantToProduct(assistantId: string): string | null {
    return ASSISTANT_PRODUCT_MAP[assistantId] || null;
  }

  async purchaseSubscription(
    userId: string,
    dto: PurchaseSubscriptionDto,
  ): Promise<PurchaseResponseDto> {
    // For testing, only accept specific test card
    const TEST_CARD = '4242424242424242';
    if (dto.cardNumber !== TEST_CARD) {
      throw new ForbiddenException('Only test card 4242 4242 4242 4242 is accepted in test mode');
    }

    // Validate expiry date
    const [month, year] = dto.cardExpiry.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      throw new BadRequestException('Card has expired');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.findActiveSubscriptionForValidation(userId, null);
    if (existingSubscription) {
      throw new BadRequestException('You already have an active subscription');
    }

    // Fetch products and their prices
    const products = await prisma.product.findMany({
      where: {
        id: { in: dto.productIds },
        deletedAt: null,
      },
      include: {
        prices: {
          where: {
            deletedAt: null,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (products.length !== dto.productIds.length) {
      throw new BadRequestException('One or more products are invalid or inactive');
    }

    // Calculate total amount and token limit
    let totalAmount = 0;
    let totalTokensLimit = 0;
    
    products.forEach(product => {
      const price = product.prices[0];
      if (!price) {
        throw new BadRequestException(`No active price found for product ${product.name}`);
      }
      totalAmount += price.priceCents;
      
      // Add tokens from this product (unlimited = very large number)
      if (product.baseTokensPerMonth === null) {
        // Unlimited tokens - use a very large number
        totalTokensLimit = 10_000_000;
      } else {
        totalTokensLimit += product.baseTokensPerMonth || 0;
      }
    });

    // Create subscription
    const startDate = new Date();
    const nextBillingDate = addMonths(startDate, 1);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        status: 'active',
        interval: 'monthly',
        startedAt: startDate,
        endsAt: null,
        tokensLimit: totalTokensLimit,
        subscriptionProducts: {
          create: products.map(product => ({
            productId: product.id,
            productPriceId: product.prices[0].id,
          })),
        },
      },
      include: {
        subscriptionProducts: {
          include: {
            Product: true,
            ProductPrice: true,
          },
        },
      },
    });

    // In a real application, you would:
    // 1. Process the payment through a payment gateway
    // 2. Store the payment method securely
    // 3. Set up recurring billing

    return {
      subscriptionId: subscription.id,
      status: 'success',
      message: 'Subscription activated successfully',
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.prices[0].priceCents,
      })),
      totalAmount,
      nextBillingDate,
    };
  }
}