import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, SubscriptionsService],
  exports: [ProductsService, SubscriptionsService], // Export for use in other modules
})
export class ProductsModule {}