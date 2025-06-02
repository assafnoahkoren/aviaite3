import { Module } from '@nestjs/common';
import { ChatModule } from './features/chat/chat.module';
import { UsersModule } from './features/users/users.module';

@Module({
  imports: [ChatModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
