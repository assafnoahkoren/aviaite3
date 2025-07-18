import { Controller, UseGuards, Param, Get, Query } from '@nestjs/common';
import { OrganizationStatisticsService } from './organization-statistics.service';
import { AuthGuard } from '@features/users/auth.guard';
import { 
  DailyUniqueUsersRangeResult, 
  DailyQuestionsRangeResult,
  DailyUsageTrendResult,
  AverageQuestionsResult,
  DailyQuestionsByCategoryResult 
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

  @Get('daily-usage-trend')
  async getDailyUsageTrend(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<DailyUsageTrendResult> {
    const orgId = !organizationId || organizationId === 'all' ? undefined : organizationId;
    
    return this.organizationStatisticsService.getDailyUsageTrend(
      orgId,
      new Date(startDate),
      new Date(endDate),
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

  @Get('daily-questions-by-category')
  async getDailyQuestionsByCategory(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<DailyQuestionsByCategoryResult> {
    const orgId = !organizationId || organizationId === 'all' ? undefined : organizationId;
    
    return this.organizationStatisticsService.getDailyQuestionsByCategory(
      orgId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}