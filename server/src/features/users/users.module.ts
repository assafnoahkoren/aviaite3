import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';

@Module({
  controllers: [UsersController, UserSettingsController],
  providers: [UsersService, UserSettingsService],
})
export class UsersModule {} 