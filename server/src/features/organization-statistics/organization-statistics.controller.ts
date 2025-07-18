import { Controller, UseGuards, Param } from '@nestjs/common';
import { OrganizationStatisticsService } from './organization-statistics.service';
import { AuthGuard } from '@features/users/auth.guard';

@Controller('organization-statistics')
@UseGuards(AuthGuard)
export class OrganizationStatisticsController {
  constructor(
    private readonly organizationStatisticsService: OrganizationStatisticsService,
  ) {}
}