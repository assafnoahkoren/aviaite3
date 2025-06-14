import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@features/users/auth.guard';
import { RolesGuard } from '@features/users/guards/roles.guard';
import { Roles } from '@features/users/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma';
import { AdminProductsService } from '../services/admin-products.service';
import { PaginationDto } from '../dto/pagination.dto';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateProductPriceDto,
} from '../dto/admin-product.dto';

@Controller('api/admin/products')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  async getProducts(@Query() pagination: PaginationDto) {
    return this.adminProductsService.getProducts(pagination);
  }

  @Get(':productId')
  async getProductById(@Param('productId') productId: string) {
    return this.adminProductsService.getProductById(productId);
  }

  @Get(':productId/stats')
  async getProductStats(@Param('productId') productId: string) {
    return this.adminProductsService.getProductStats(productId);
  }

  @Post()
  async createProduct(@Body() createDto: CreateProductDto) {
    return this.adminProductsService.createProduct(createDto);
  }

  @Patch(':productId')
  async updateProduct(
    @Param('productId') productId: string,
    @Body() updateDto: UpdateProductDto,
  ) {
    return this.adminProductsService.updateProduct(productId, updateDto);
  }

  @Patch('prices/:priceId')
  async updateProductPrice(
    @Param('priceId') priceId: string,
    @Body() updateDto: UpdateProductPriceDto,
  ) {
    return this.adminProductsService.updateProductPrice(priceId, updateDto);
  }

  @Delete(':productId')
  async deleteProduct(@Param('productId') productId: string) {
    return this.adminProductsService.deleteProduct(productId);
  }
}