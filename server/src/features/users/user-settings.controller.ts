import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { AuthGuard, AuthedRequest } from './auth.guard';
import { Prisma } from '../../../generated/prisma';

@Controller('api/users/settings')
@UseGuards(AuthGuard)
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  getSettings(@Req() req: AuthedRequest) {
    return this.userSettingsService.getSettings(req.user.id);
  }

  @Patch()
  updateSettings(@Req() req: AuthedRequest, @Body() settings: Prisma.JsonValue) {
    return this.userSettingsService.updateSettings(req.user.id, settings);
  }

  @Delete()
  deleteSettings(@Req() req: AuthedRequest) {
    return this.userSettingsService.deleteSettings(req.user.id);
  }
} 