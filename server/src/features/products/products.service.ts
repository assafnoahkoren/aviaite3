import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class ProductsService {
  async getAllProducts() {
    // Implementation will be added
  }

  async getProductById(productId: string) {
    // Implementation will be added
  }

  async createProduct(data: any) {
    // Implementation will be added
  }

  async updateProduct(productId: string, data: any) {
    // Implementation will be added
  }

  async deleteProduct(productId: string) {
    // Implementation will be added
  }

  async getProductPrices(productId: string) {
    // Implementation will be added
  }
}