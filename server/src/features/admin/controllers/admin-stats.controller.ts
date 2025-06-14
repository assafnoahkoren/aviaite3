import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@features/users/auth.guard';
import { RolesGuard } from '@features/users/guards/roles.guard';
import { Roles } from '@features/users/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma';
import { AdminStatsService } from '../services/admin-stats.service';

@Controller('api/admin/stats')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminStatsService.getDashboardStats();
  }

  @Get('growth')
  async getGrowthStats(@Query('period') period?: 'day' | 'week' | 'month') {
    return this.adminStatsService.getGrowthStats(period || 'month');
  }
}