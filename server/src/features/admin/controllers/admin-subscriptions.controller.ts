import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@features/users/auth.guard';
import { RolesGuard } from '@features/users/guards/roles.guard';
import { Roles } from '@features/users/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma';
import { AdminSubscriptionsService } from '../services/admin-subscriptions.service';
import { PaginationDto } from '../dto/pagination.dto';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionFilterDto,
} from '../dto/admin-subscription.dto';

@Controller('api/admin/subscriptions')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminSubscriptionsController {
  constructor(
    private readonly adminSubscriptionsService: AdminSubscriptionsService,
  ) {}

  @Get()
  async getSubscriptions(
    @Query() pagination: PaginationDto,
    @Query() filters: SubscriptionFilterDto,
  ) {
    return this.adminSubscriptionsService.getSubscriptions(pagination, filters);
  }

  @Get('stats')
  async getSubscriptionStats() {
    return this.adminSubscriptionsService.getSubscriptionStats();
  }

  @Get(':subscriptionId')
  async getSubscriptionById(@Param('subscriptionId') subscriptionId: string) {
    return this.adminSubscriptionsService.getSubscriptionById(subscriptionId);
  }

  @Post()
  async createSubscription(@Body() createDto: CreateSubscriptionDto) {
    return this.adminSubscriptionsService.createSubscription(createDto);
  }

  @Patch(':subscriptionId')
  async updateSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() updateDto: UpdateSubscriptionDto,
  ) {
    return this.adminSubscriptionsService.updateSubscription(
      subscriptionId,
      updateDto,
    );
  }

  @Post(':subscriptionId/cancel')
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.adminSubscriptionsService.cancelSubscription(subscriptionId);
  }
}