import { Controller, UseGuards, Param, Get, Query } from '@nestjs/common';
import { OrganizationStatisticsService } from './organization-statistics.service';
import { AuthGuard } from '@features/users/auth.guard';
import { DailyUniqueUsersRangeResult } from './dto/statistics-response.dto';

@Controller('organization-statistics')
@UseGuards(AuthGuard)
export class OrganizationStatisticsController {
  constructor(
    private readonly organizationStatisticsService: OrganizationStatisticsService,
  ) {}

  @Get('daily-unique-users')
  async getDailyUniqueUsers(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<DailyUniqueUsersRangeResult> {
    // Handle 'all' or missing organizationId to get all organizations
    const orgId = !organizationId || organizationId === 'all' ? undefined : organizationId;
    
    return this.organizationStatisticsService.getDailyUniqueUsers(
      orgId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}