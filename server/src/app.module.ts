import { Module } from '@nestjs/common';
import { ChatModule } from './features/chat/chat.module';
import { UsersModule } from './features/users/users.module';
import { AdminModule } from './features/admin/admin.module';
import { TokenUsageModule } from './features/token-usage/token-usage.module';
import { ProductsModule } from './features/products/products.module';
import { OrganizationStatisticsModule } from './features/organization-statistics/organization-statistics.module';

@Module({
  imports: [ChatModule, UsersModule, AdminModule, TokenUsageModule, ProductsModule, OrganizationStatisticsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
