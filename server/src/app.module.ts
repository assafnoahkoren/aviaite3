import { Module } from '@nestjs/common';
import { ChatModule } from './features/chat/chat.module';
import { UsersModule } from './features/users/users.module';
import { AdminModule } from './features/admin/admin.module';
import { TokenUsageModule } from './features/token-usage/token-usage.module';

@Module({
  imports: [ChatModule, UsersModule, AdminModule, TokenUsageModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
