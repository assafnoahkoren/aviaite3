import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { PaginationDto, PaginatedResponse } from '../dto/pagination.dto';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateProductPriceDto,
} from '../dto/admin-product.dto';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
export class AdminProductsService {
  async getProducts(pagination: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          prices: {
            where: { deletedAt: null },
            orderBy: { interval: 'asc' },
          },
          _count: {
            select: {
              SubscriptionProducts: true,
              UserTokenUsages: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        prices: {
          where: { deletedAt: null },
          orderBy: { interval: 'asc' },
        },
        SubscriptionProducts: {
          where: { deletedAt: null },
          take: 10,
          include: {
            Subscription: {
              include: {
                User: {
                  select: {
                    id: true,
                    email: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            SubscriptionProducts: true,
            UserTokenUsages: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(createDto: CreateProductDto) {
    const { prices, ...productData } = createDto;

    const product = await prisma.product.create({
      data: {
        ...productData,
        prices: {
          create: prices,
        },
      },
      include: {
        prices: true,
      },
    });

    return product;
  }

  async updateProduct(productId: string, updateDto: UpdateProductDto) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateDto,
      include: {
        prices: {
          where: { deletedAt: null },
        },
      },
    });

    return updatedProduct;
  }

  async updateProductPrice(
    productPriceId: string,
    updateDto: UpdateProductPriceDto,
  ) {
    const productPrice = await prisma.productPrice.findUnique({
      where: { id: productPriceId },
    });

    if (!productPrice) {
      throw new NotFoundException('Product price not found');
    }

    const updatedPrice = await prisma.productPrice.update({
      where: { id: productPriceId },
      data: updateDto,
    });

    return updatedPrice;
  }

  async deleteProduct(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: {
            SubscriptionProducts: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product._count.SubscriptionProducts > 0) {
      throw new BadRequestException(
        'Cannot delete product with active subscriptions',
      );
    }

    // Soft delete product and its prices
    await prisma.$transaction([
      prisma.productPrice.updateMany({
        where: { productId, deletedAt: null },
        data: { deletedAt: new Date() },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { deletedAt: new Date() },
      }),
    ]);

    return { message: 'Product deleted successfully' };
  }

  async getProductStats(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const [
      activeSubscriptions,
      totalRevenueCents,
      tokenUsageStats,
      revenueByInterval,
    ] = await Promise.all([
      prisma.subscriptionProduct.count({
        where: {
          productId,
          deletedAt: null,
          Subscription: {
            status: 'active',
            deletedAt: null,
          },
        },
      }),
      // Calculate revenue manually since we can't aggregate across relations
      prisma.$queryRaw<[{ total: number }]>`
        SELECT SUM(pp."priceCents") as total
        FROM "SubscriptionProduct" sp
        JOIN "ProductPrice" pp ON pp.id = sp."productPriceId"
        WHERE sp."productId" = ${productId}
        AND sp."deletedAt" IS NULL
      `,
      prisma.userTokenUsage.aggregate({
        where: {
          productId,
          deletedAt: null,
        },
        _sum: {
          tokensUsed: true,
          costInCents: true,
        },
        _count: true,
      }),
      prisma.productPrice.findMany({
        where: {
          productId,
          deletedAt: null,
        },
        select: {
          interval: true,
          priceCents: true,
          _count: {
            select: {
              SubscriptionProducts: {
                where: {
                  deletedAt: null,
                  Subscription: {
                    status: 'active',
                    deletedAt: null,
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      productId,
      productName: product.name,
      activeSubscriptions,
      totalRevenueCents: totalRevenueCents[0]?.total || 0,
      tokenUsage: {
        totalTokens: tokenUsageStats._sum.tokensUsed || 0,
        totalCostCents: tokenUsageStats._sum.costInCents || 0,
        totalEvents: tokenUsageStats._count,
      },
      revenueByInterval: revenueByInterval.map(price => ({
        interval: price.interval,
        priceCents: price.priceCents,
        activeSubscriptions: price._count.SubscriptionProducts,
        monthlyRevenueCents:
          price.interval === 'monthly'
            ? price.priceCents * price._count.SubscriptionProducts
            : price.priceCents * price._count.SubscriptionProducts / 12,
      })),
    };
  }
}