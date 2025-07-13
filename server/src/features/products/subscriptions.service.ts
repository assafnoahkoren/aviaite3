import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { Prisma, BillingInterval } from '../../../generated/prisma';
import { CreateSubscriptionDto, UpdateSubscriptionDto, ValidationResponseDto } from './dto';
import { startOfMonth, endOfMonth } from 'date-fns';

// Assistant to Product mapping
export const ASSISTANT_PRODUCT_MAP: Record<string, string> = {
  'asst_GiwIP1vySr6XctY9w7NvunLw': 'ace-737', // Co-Pilot-737-V2
  'asst_StHM7qcEs2TkCFvc89KGBETy': 'ace-737', // elal-737
  'asst_fZC1wK2LvYo8a93nqMVgGrnf': 'ace-787', // 787-NEW
  'asst_9cw3eNl5AIUH1YAsyDmKgK85': 'ace-787', // elal-787
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

      // Check if user has the mapped product
      const hasProduct = subscription.subscriptionProducts.some(
        (sp) => sp.Product.name === mappedProductName,
      );
      
      if (!hasProduct) {
        return {
          hasAccess: false,
          reason: `Assistant requires ${mappedProductName} product`,
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

    // Calculate total token limit from all products
    const tokenLimit = subscription.subscriptionProducts.reduce((total, sp) => {
      return total + (sp.Product.baseTokensPerMonth || 0);
    }, 0);

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

  private mapAssistantToProduct(assistantId: string): string | null {
    return ASSISTANT_PRODUCT_MAP[assistantId] || null;
  }
}