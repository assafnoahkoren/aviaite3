import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';
import { TutorialController } from './tutorial.controller';
import { TutorialService } from './tutorial.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { RolesGuard } from './guards/roles.guard';

@Module({
  controllers: [UsersController, UserSettingsController, TutorialController, OnboardingController],
  providers: [UsersService, UserSettingsService, TutorialService, OnboardingService, RolesGuard],
  exports: [RolesGuard],
})
export class UsersModule {} 