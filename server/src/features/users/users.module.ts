import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';
import { RolesGuard } from './guards/roles.guard';

@Module({
  controllers: [UsersController, UserSettingsController],
  providers: [UsersService, UserSettingsService, RolesGuard],
  exports: [RolesGuard],
})
export class UsersModule {} 