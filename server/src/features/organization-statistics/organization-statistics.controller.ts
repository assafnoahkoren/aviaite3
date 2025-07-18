import { Controller, UseGuards, Param, Get, Query } from '@nestjs/common';
import { OrganizationStatisticsService } from './organization-statistics.service';
import { AuthGuard } from '@features/users/auth.guard';
import { 
  DailyUniqueUsersRangeResult, 
  DailyQuestionsRangeResult,
  WeeklyUsageTrendResult,
  AverageQuestionsResult,
  WeeklyQuestionsByCategoryResult 
} from './dto/statistics-response.dto';

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

  @Get('daily-questions-per-user')
  async getDailyQuestionsPerUser(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<DailyQuestionsRangeResult> {
    const orgId = !organizationId || organizationId === 'all' ? undefined : organizationId;
    
    return this.organizationStatisticsService.getDailyQuestionsPerUser(
      orgId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('weekly-usage-trend')
  async getWeeklyUsageTrend(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
  ): Promise<WeeklyUsageTrendResult> {
    const orgId = !organizationId || organizationId === 'all' ? undefined : organizationId;
    
    return this.organizationStatisticsService.getWeeklyUsageTrend(
      orgId,
      new Date(startDate),
    );
  }

  @Get('average-questions-per-user')
  async getAverageQuestionsPerUser(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<AverageQuestionsResult> {
    const orgId = !organizationId || organizationId === 'all' ? undefined : organizationId;
    
    return this.organizationStatisticsService.getAverageQuestionsPerUser(
      orgId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('weekly-questions-by-category')
  async getWeeklyQuestionsByCategory(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
  ): Promise<WeeklyQuestionsByCategoryResult> {
    const orgId = !organizationId || organizationId === 'all' ? undefined : organizationId;
    
    return this.organizationStatisticsService.getWeeklyQuestionsByCategory(
      orgId,
      new Date(startDate),
    );
  }
}