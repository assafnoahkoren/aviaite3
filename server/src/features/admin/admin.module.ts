import { Module } from '@nestjs/common';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminOrganizationsController } from './controllers/admin-organizations.controller';
import { AdminSubscriptionsController } from './controllers/admin-subscriptions.controller';
import { AdminProductsController } from './controllers/admin-products.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminRegistrationTokensController } from './controllers/admin-registration-tokens.controller';
import { AdminUsersService } from './services/admin-users.service';
import { AdminOrganizationsService } from './services/admin-organizations.service';
import { AdminSubscriptionsService } from './services/admin-subscriptions.service';
import { AdminProductsService } from './services/admin-products.service';
import { AdminStatsService } from './services/admin-stats.service';
import { AdminRegistrationTokensService } from './services/admin-registration-tokens.service';

@Module({
  controllers: [
    AdminUsersController,
    AdminOrganizationsController,
    AdminSubscriptionsController,
    AdminProductsController,
    AdminStatsController,
    AdminRegistrationTokensController,
  ],
  providers: [
    AdminUsersService,
    AdminOrganizationsService,
    AdminSubscriptionsService,
    AdminProductsService,
    AdminStatsService,
    AdminRegistrationTokensService,
  ],
})
export class AdminModule {}