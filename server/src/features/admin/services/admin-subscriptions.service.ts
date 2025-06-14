import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { PaginationDto, PaginatedResponse } from '../dto/pagination.dto';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionFilterDto,
} from '../dto/admin-subscription.dto';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
export class AdminSubscriptionsService {
  async getSubscriptions(
    pagination: PaginationDto,
    filters: SubscriptionFilterDto,
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, search, sortBy = 'startedAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.SubscriptionWhereInput = {
      deletedAt: null,
      ...(filters.status && { status: filters.status }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.interval && { interval: filters.interval }),
      ...(search && {
        User: {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          User: {
            select: {
              id: true,
              email: true,
              fullName: true,
              organizationId: true,
            },
          },
          subscriptionProducts: {
            where: { deletedAt: null },
            include: {
              Product: true,
              ProductPrice: true,
            },
          },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSubscriptionById(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            fullName: true,
            organizationId: true,
            Organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subscriptionProducts: {
          where: { deletedAt: null },
          include: {
            Product: true,
            ProductPrice: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async createSubscription(createDto: CreateSubscriptionDto) {
    const { products, ...subscriptionData } = createDto;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: createDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create subscription with products
    const subscription = await prisma.subscription.create({
      data: {
        ...subscriptionData,
        status: subscriptionData.status || 'active',
        subscriptionProducts: {
          create: products,
        },
      },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        subscriptionProducts: {
          include: {
            Product: true,
            ProductPrice: true,
          },
        },
      },
    });

    return subscription;
  }

  async updateSubscription(
    subscriptionId: string,
    updateDto: UpdateSubscriptionDto,
  ) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        ...updateDto,
        ...(updateDto.endsAt && { endsAt: new Date(updateDto.endsAt) }),
      },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        subscriptionProducts: {
          where: { deletedAt: null },
          include: {
            Product: true,
            ProductPrice: true,
          },
        },
      },
    });

    return updatedSubscription;
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const cancelledSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'cancelled',
        endsAt: new Date(),
      },
    });

    return cancelledSubscription;
  }

  async getSubscriptionStats() {
    const [
      totalActive,
      totalCancelled,
      revenueByInterval,
      monthlyRecurringRevenue,
      recentSubscriptions,
    ] = await Promise.all([
      prisma.subscription.count({
        where: { status: 'active', deletedAt: null },
      }),
      prisma.subscription.count({
        where: { status: 'cancelled', deletedAt: null },
      }),
      prisma.subscription.groupBy({
        by: ['interval', 'status'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.$queryRaw<[{ total: number }]>`
        SELECT SUM(
          CASE 
            WHEN s.interval = 'monthly' THEN pp."priceCents"
            WHEN s.interval = 'yearly' THEN pp."priceCents" / 12
          END
        ) as total
        FROM "Subscription" s
        JOIN "SubscriptionProduct" sp ON sp."subscriptionId" = s.id
        JOIN "ProductPrice" pp ON pp.id = sp."productPriceId"
        WHERE s.status = 'active' 
        AND s."deletedAt" IS NULL
        AND sp."deletedAt" IS NULL
      `,
      prisma.subscription.findMany({
        where: { deletedAt: null },
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: {
          User: {
            select: {
              email: true,
              fullName: true,
            },
          },
          subscriptionProducts: {
            where: { deletedAt: null },
            include: {
              Product: {
                select: { name: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      totalActive,
      totalCancelled,
      revenueByInterval,
      monthlyRecurringRevenueCents: monthlyRecurringRevenue[0]?.total || 0,
      recentSubscriptions,
    };
  }
}