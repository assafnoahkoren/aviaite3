import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard, AuthedRequest } from '../users/auth.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { Role } from '../../../generated/prisma';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  ValidateAccessDto,
} from './dto';

@Controller('api/products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // Products endpoints
  @Get()
  async getAllProducts(@Query('includeDeleted') includeDeleted?: string) {
    return this.productsService.getAllProducts(includeDeleted === 'true');
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  // Product price endpoints
  @Get(':id/prices')
  async getProductPrices(@Param('id') id: string) {
    return this.productsService.getProductPrices(id);
  }

  @Post(':id/prices')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async addProductPrice(
    @Param('id') id: string,
    @Body() priceData: { interval: 'monthly' | 'yearly'; priceCents: number; currency: string },
  ) {
    return this.productsService.addProductPrice(id, priceData);
  }

  @Patch('prices/:priceId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateProductPrice(
    @Param('priceId') priceId: string,
    @Body() data: { priceCents?: number; currency?: string },
  ) {
    return this.productsService.updateProductPrice(priceId, data);
  }

  @Delete('prices/:priceId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteProductPrice(@Param('priceId') priceId: string) {
    return this.productsService.deleteProductPrice(priceId);
  }

  // Subscription endpoints
  @Get('subscriptions')
  async getUserSubscriptions(@Req() req: AuthedRequest) {
    return this.subscriptionsService.getUserSubscriptions(req.user.id);
  }

  @Get('subscriptions/active')
  async getActiveSubscription(@Req() req: AuthedRequest) {
    return this.subscriptionsService.getActiveSubscription(req.user.id);
  }

  @Post('subscriptions')
  async createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto, @Req() req: AuthedRequest) {
    return this.subscriptionsService.createSubscription(req.user.id, createSubscriptionDto);
  }

  @Patch('subscriptions/:id')
  async updateSubscription(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Req() req: AuthedRequest,
  ) {
    return this.subscriptionsService.updateSubscription(id, req.user.id, updateSubscriptionDto);
  }

  @Post('subscriptions/:id/cancel')
  async cancelSubscription(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.subscriptionsService.cancelSubscription(id, req.user.id);
  }

  @Post('subscriptions/validate-access')
  async validateAccess(@Body() validateAccessDto: ValidateAccessDto, @Req() req: AuthedRequest) {
    return this.subscriptionsService.validateSubscriptionAccess(req.user.id, validateAccessDto);
  }

  @Get('subscriptions/usage')
  async getTokenUsage(@Req() req: AuthedRequest) {
    const activeSubscription = await this.subscriptionsService.getActiveSubscription(req.user.id);
    if (!activeSubscription) {
      return { used: 0, limit: 0, remaining: 0, percentUsed: 0 };
    }
    return activeSubscription.usage;
  }
}