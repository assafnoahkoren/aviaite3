import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { Prisma } from '../../../generated/prisma';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  async getAllProducts(includeDeleted = false) {
    const where: Prisma.ProductWhereInput = includeDeleted ? {} : { deletedAt: null };
    
    return prisma.product.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        prices: {
          where: { deletedAt: null },
          orderBy: { interval: 'asc' },
        },
        _count: {
          select: {
            SubscriptionProducts: {
              where: { deletedAt: null },
            },
            UserTokenUsages: true,
          },
        },
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(data: CreateProductDto) {
    const { prices, ...productData } = data;

    // Validate that prices are provided
    if (!prices || prices.length === 0) {
      throw new BadRequestException('At least one price must be provided');
    }

    // Create product with prices in a transaction
    const product = await prisma.product.create({
      data: {
        ...productData,
        prices: {
          create: prices,
        },
      },
      include: {
        prices: {
          where: { deletedAt: null },
        },
      },
    });

    return product;
  }

  async updateProduct(productId: string, data: UpdateProductDto) {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct || existingProduct.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data,
      include: {
        prices: {
          where: { deletedAt: null },
        },
      },
    });

    return updatedProduct;
  }

  async deleteProduct(productId: string) {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
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
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    // Prevent deletion if there are active subscriptions
    if (product._count.SubscriptionProducts > 0) {
      throw new BadRequestException(
        `Cannot delete product with ${product._count.SubscriptionProducts} active subscriptions`
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

    return { message: 'Product deleted successfully', productId };
  }

  async getProductPrices(productId: string) {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, deletedAt: true },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    return prisma.productPrice.findMany({
      where: {
        productId,
        deletedAt: null,
      },
      orderBy: [
        { interval: 'asc' },
        { priceCents: 'asc' },
      ],
    });
  }

  async addProductPrice(productId: string, priceData: { interval: 'monthly' | 'yearly'; priceCents: number; currency: string }) {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    // Check if price for this interval already exists
    const existingPrice = await prisma.productPrice.findFirst({
      where: {
        productId,
        interval: priceData.interval,
        deletedAt: null,
      },
    });

    if (existingPrice) {
      throw new BadRequestException(`Price for ${priceData.interval} interval already exists`);
    }

    return prisma.productPrice.create({
      data: {
        productId,
        ...priceData,
      },
    });
  }

  async updateProductPrice(priceId: string, data: { priceCents?: number; currency?: string }) {
    const price = await prisma.productPrice.findUnique({
      where: { id: priceId },
    });

    if (!price || price.deletedAt) {
      throw new NotFoundException('Product price not found');
    }

    return prisma.productPrice.update({
      where: { id: priceId },
      data,
    });
  }

  async deleteProductPrice(priceId: string) {
    const price = await prisma.productPrice.findUnique({
      where: { id: priceId },
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

    if (!price || price.deletedAt) {
      throw new NotFoundException('Product price not found');
    }

    if (price._count.SubscriptionProducts > 0) {
      throw new BadRequestException('Cannot delete price that is being used by active subscriptions');
    }

    return prisma.productPrice.update({
      where: { id: priceId },
      data: { deletedAt: new Date() },
    });
  }
}