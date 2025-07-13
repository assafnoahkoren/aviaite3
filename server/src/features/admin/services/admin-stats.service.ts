import { Injectable } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { calculateTokenCost, MODEL_PRICING } from '@services/token-pricing';
import { TokenType } from '../../../../generated/prisma';

@Injectable()
export class AdminStatsService {
  async getDashboardStats() {
    const [
      userStats,
      organizationStats,
      subscriptionStats,
      revenueStats,
      usageStats,
      recentActivity,
    ] = await Promise.all([
      this.getUserStats(),
      this.getOrganizationStats(),
      this.getSubscriptionStats(),
      this.getRevenueStats(),
      this.getUsageStats(),
      this.getRecentActivity(),
    ]);

    return {
      userStats,
      organizationStats,
      subscriptionStats,
      revenueStats,
      usageStats,
      recentActivity,
    };
  }

  private async getUserStats() {
    const [total, active, verified, admins, newThisMonth] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { isActive: true, deletedAt: null } }),
      prisma.user.count({ where: { verified: true, deletedAt: null } }),
      prisma.user.count({ where: { role: 'ADMIN', deletedAt: null } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1)), // First day of current month
          },
          deletedAt: null,
        },
      }),
    ]);

    return {
      total,
      active,
      verified,
      admins,
      newThisMonth,
      activePercentage: total > 0 ? (active / total) * 100 : 0,
    };
  }

  private async getOrganizationStats() {
    const [total, active, averageUsersPerOrg] = await Promise.all([
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.organization.count({
        where: { isActive: true, deletedAt: null },
      }),
      prisma.$queryRaw<[{ avg: number }]>`
        SELECT AVG(user_count)::float as avg
        FROM (
          SELECT COUNT(u.id) as user_count
          FROM "Organization" o
          LEFT JOIN "User" u ON u."organizationId" = o.id AND u."deletedAt" IS NULL
          WHERE o."deletedAt" IS NULL
          GROUP BY o.id
        ) as org_users
      `,
    ]);

    return {
      total,
      active,
      averageUsersPerOrg: Math.round(averageUsersPerOrg[0]?.avg || 0),
    };
  }

  private async getSubscriptionStats() {
    const [active, cancelled, monthlyCount, yearlyCount] = await Promise.all([
      prisma.subscription.count({
        where: { status: 'active', deletedAt: null },
      }),
      prisma.subscription.count({
        where: { status: 'cancelled', deletedAt: null },
      }),
      prisma.subscription.count({
        where: {
          status: 'active',
          interval: 'monthly',
          deletedAt: null,
        },
      }),
      prisma.subscription.count({
        where: {
          status: 'active',
          interval: 'yearly',
          deletedAt: null,
        },
      }),
    ]);

    const churnRate = active + cancelled > 0 
      ? (cancelled / (active + cancelled)) * 100 
      : 0;

    return {
      active,
      cancelled,
      monthlyCount,
      yearlyCount,
      churnRate: Math.round(churnRate * 10) / 10,
    };
  }

  private async getRevenueStats() {
    const monthlyRecurringRevenue = await prisma.$queryRaw<[{ mrr: bigint }]>`
      SELECT SUM(
        CASE 
          WHEN s.interval = 'monthly' THEN pp."priceCents"
          WHEN s.interval = 'yearly' THEN pp."priceCents" / 12
        END
      )::bigint as mrr
      FROM "Subscription" s
      JOIN "SubscriptionProduct" sp ON sp."subscriptionId" = s.id
      JOIN "ProductPrice" pp ON pp.id = sp."productPriceId"
      WHERE s.status = 'active' 
      AND s."deletedAt" IS NULL
      AND sp."deletedAt" IS NULL
    `;

    const annualRecurringRevenue = await prisma.$queryRaw<[{ arr: bigint }]>`
      SELECT SUM(
        CASE 
          WHEN s.interval = 'monthly' THEN pp."priceCents" * 12
          WHEN s.interval = 'yearly' THEN pp."priceCents"
        END
      )::bigint as arr
      FROM "Subscription" s
      JOIN "SubscriptionProduct" sp ON sp."subscriptionId" = s.id
      JOIN "ProductPrice" pp ON pp.id = sp."productPriceId"
      WHERE s.status = 'active' 
      AND s."deletedAt" IS NULL
      AND sp."deletedAt" IS NULL
    `;

    const averageRevenuePerUser = await prisma.$queryRaw<[{ arpu: number }]>`
      SELECT AVG(user_revenue)::float as arpu
      FROM (
        SELECT u.id, SUM(
          CASE 
            WHEN s.interval = 'monthly' THEN pp."priceCents"
            WHEN s.interval = 'yearly' THEN pp."priceCents" / 12
          END
        ) as user_revenue
        FROM "User" u
        JOIN "Subscription" s ON s."userId" = u.id
        JOIN "SubscriptionProduct" sp ON sp."subscriptionId" = s.id
        JOIN "ProductPrice" pp ON pp.id = sp."productPriceId"
        WHERE s.status = 'active' 
        AND s."deletedAt" IS NULL
        AND sp."deletedAt" IS NULL
        AND u."deletedAt" IS NULL
        GROUP BY u.id
      ) as user_revenues
    `;

    return {
      monthlyRecurringRevenueCents: Number(monthlyRecurringRevenue[0]?.mrr || 0n),
      annualRecurringRevenueCents: Number(annualRecurringRevenue[0]?.arr || 0n),
      averageRevenuePerUserCents: Math.round(averageRevenuePerUser[0]?.arpu || 0),
    };
  }

  private async getUsageStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalTokensUsed, usageByModelAndType, dailyUsageByType] = await Promise.all([
      prisma.userTokenUsage.aggregate({
        where: {
          date: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
        _sum: {
          tokensUsed: true,
        },
      }),
      prisma.userTokenUsage.groupBy({
        by: ['modelUsed', 'tokenType'],
        where: {
          date: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
        _sum: {
          tokensUsed: true,
        },
      }),
      prisma.userTokenUsage.groupBy({
        by: ['date', 'modelUsed', 'tokenType'],
        where: {
          date: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
        _sum: {
          tokensUsed: true,
        },
        orderBy: {
          date: 'desc',
        },
      }),
    ]);

    // Calculate total cost dynamically
    let totalCostCents = 0;
    usageByModelAndType.forEach(usage => {
      const cost = calculateTokenCost(
        usage.modelUsed,
        usage._sum.tokensUsed || 0,
        usage.tokenType
      );
      totalCostCents += cost;
    });

    // Group usage by model and calculate costs
    const modelMap = new Map<string, { totalTokens: number; totalCostCents: number }>();
    usageByModelAndType.forEach(usage => {
      const model = usage.modelUsed;
      if (!modelMap.has(model)) {
        modelMap.set(model, { totalTokens: 0, totalCostCents: 0 });
      }
      const data = modelMap.get(model)!;
      data.totalTokens += usage._sum.tokensUsed || 0;
      data.totalCostCents += calculateTokenCost(
        model,
        usage._sum.tokensUsed || 0,
        usage.tokenType
      );
    });

    // Group daily usage and calculate costs
    const dailyMap = new Map<string, { totalTokens: number; totalCostCents: number }>();
    dailyUsageByType.forEach(usage => {
      const dateStr = usage.date.toISOString().split('T')[0];
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { totalTokens: 0, totalCostCents: 0 });
      }
      const data = dailyMap.get(dateStr)!;
      data.totalTokens += usage._sum.tokensUsed || 0;
      data.totalCostCents += calculateTokenCost(
        usage.modelUsed,
        usage._sum.tokensUsed || 0,
        usage.tokenType
      );
    });

    const dailyUsage = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    return {
      last30Days: {
        totalTokens: totalTokensUsed._sum.tokensUsed || 0,
        totalCostCents,
      },
      byModel: Array.from(modelMap.entries()).map(([model, data]) => ({
        model,
        totalTokens: data.totalTokens,
        totalCostCents: data.totalCostCents,
      })),
      dailyUsage,
    };
  }

  private async getRecentActivity() {
    const [recentUsers, recentSubscriptions, recentThreads] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      }),
      prisma.subscription.findMany({
        where: { deletedAt: null },
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: {
          User: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.thread.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          User: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      }),
    ]);

    return {
      recentUsers,
      recentSubscriptions,
      recentThreads,
    };
  }

  async getGrowthStats(period: 'day' | 'week' | 'month' = 'month') {
    const periodDays = period === 'day' ? 30 : period === 'week' ? 12 : 12;
    const intervalDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;

    const dates: Date[] = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * intervalDays));
      dates.push(date);
    }

    const growthData = await Promise.all(
      dates.map(async (date, index) => {
        const nextDate = index < dates.length - 1 ? dates[index + 1] : new Date();
        
        const [newUsers, newSubscriptions, revenue] = await Promise.all([
          prisma.user.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
              deletedAt: null,
            },
          }),
          prisma.subscription.count({
            where: {
              startedAt: {
                gte: date,
                lt: nextDate,
              },
              deletedAt: null,
            },
          }),
          prisma.$queryRaw<[{ revenue: bigint }]>`
            SELECT COALESCE(SUM(pp."priceCents"), 0)::bigint as revenue
            FROM "Subscription" s
            JOIN "SubscriptionProduct" sp ON sp."subscriptionId" = s.id
            JOIN "ProductPrice" pp ON pp.id = sp."productPriceId"
            WHERE s."startedAt" >= ${date}
            AND s."startedAt" < ${nextDate}
            AND s."deletedAt" IS NULL
            AND sp."deletedAt" IS NULL
          `,
        ]);

        return {
          date: date.toISOString().split('T')[0],
          newUsers,
          newSubscriptions,
          revenueCents: Number(revenue[0]?.revenue || 0n),
        };
      }),
    );

    return {
      period,
      data: growthData,
    };
  }
}