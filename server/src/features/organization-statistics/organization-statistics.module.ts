import { Module } from '@nestjs/common';
import { OrganizationStatisticsController } from './organization-statistics.controller';
import { OrganizationStatisticsService } from './organization-statistics.service';

@Module({
  controllers: [OrganizationStatisticsController],
  providers: [OrganizationStatisticsService],
  exports: [OrganizationStatisticsService],
})
export class OrganizationStatisticsModule {}