import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TokenUsageService } from './token-usage.service';
import {
  TokenUsageQueryDto,
  DailyUsageQueryDto,
  UserUsageParamsDto,
  OrganizationUsageParamsDto,
} from './dto/token-usage-query.dto';
import { AuthGuard, AuthedRequest } from '../users/auth.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { Role } from '../../../generated/prisma';

@Controller('api/admin/token-usage')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Require ADMIN role for all endpoints by default
export class TokenUsageController {
  constructor(private readonly tokenUsageService: TokenUsageService) {}

  /**
   * Get all token usage records with pagination and filters
   */
  @Get()
  async getAllTokenUsage(
    @Query() query: TokenUsageQueryDto,
  ) {
    const filters = {
      userId: query.userId,
      organizationId: query.organizationId,
      modelUsed: query.modelUsed,
      tokenType: query.tokenType,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    return this.tokenUsageService.getAllTokenUsage(
      query.page,
      query.limit,
      filters,
    );
  }

  /**
   * Get token usage for a specific user
   */
  @Get('user/:userId')
  async getUserTokenUsage(
    @Param() params: UserUsageParamsDto,
    @Query() query: TokenUsageQueryDto,
  ) {

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.tokenUsageService.getUserTokenUsage(
      params.userId,
      startDate,
      endDate,
    );
  }

  /**
   * Get token usage for a specific organization
   */
  @Get('organization/:organizationId')
  async getOrganizationTokenUsage(
    @Param() params: OrganizationUsageParamsDto,
    @Query() query: TokenUsageQueryDto,
  ) {

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.tokenUsageService.getOrganizationTokenUsage(
      params.organizationId,
      startDate,
      endDate,
    );
  }

  /**
   * Get daily token usage trends
   */
  @Get('daily')
  async getDailyTokenUsage(
    @Query() query: DailyUsageQueryDto,
  ) {

    return this.tokenUsageService.getDailyTokenUsage(
      query.days,
      query.organizationId,
    );
  }

  /**
   * Get token usage breakdown by model
   */
  @Get('models')
  async getModelUsageBreakdown(
    @Query() query: TokenUsageQueryDto,
  ) {

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.tokenUsageService.getModelUsageBreakdown(
      startDate,
      endDate,
      query.organizationId,
    );
  }

  /**
   * Get current user's own token usage (non-admin endpoint)
   */
  @Roles() // Clear roles requirement - any authenticated user can access
  @Get('my-usage')
  async getMyTokenUsage(
    @Query() query: TokenUsageQueryDto,
    @Req() req: AuthedRequest,
  ) {
    // Any authenticated user can see their own usage
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.tokenUsageService.getUserTokenUsage(
      req.user.id,
      startDate,
      endDate,
    );
  }
}