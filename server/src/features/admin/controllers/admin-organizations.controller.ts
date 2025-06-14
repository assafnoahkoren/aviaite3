import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@features/users/auth.guard';
import { RolesGuard } from '@features/users/guards/roles.guard';
import { Roles } from '@features/users/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma';
import { AdminOrganizationsService } from '../services/admin-organizations.service';
import { PaginationDto } from '../dto/pagination.dto';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationFilterDto,
} from '../dto/admin-organization.dto';

@Controller('api/admin/organizations')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrganizationsController {
  constructor(
    private readonly adminOrganizationsService: AdminOrganizationsService,
  ) {}

  @Get()
  async getOrganizations(
    @Query() pagination: PaginationDto,
    @Query() filters: OrganizationFilterDto,
  ) {
    return this.adminOrganizationsService.getOrganizations(pagination, filters);
  }

  @Get(':organizationId')
  async getOrganizationById(@Param('organizationId') organizationId: string) {
    return this.adminOrganizationsService.getOrganizationById(organizationId);
  }

  @Get(':organizationId/stats')
  async getOrganizationStats(@Param('organizationId') organizationId: string) {
    return this.adminOrganizationsService.getOrganizationStats(organizationId);
  }

  @Post()
  async createOrganization(@Body() createDto: CreateOrganizationDto) {
    return this.adminOrganizationsService.createOrganization(createDto);
  }

  @Patch(':organizationId')
  async updateOrganization(
    @Param('organizationId') organizationId: string,
    @Body() updateDto: UpdateOrganizationDto,
  ) {
    return this.adminOrganizationsService.updateOrganization(
      organizationId,
      updateDto,
    );
  }

  @Delete(':organizationId')
  async deleteOrganization(@Param('organizationId') organizationId: string) {
    return this.adminOrganizationsService.deleteOrganization(organizationId);
  }
}