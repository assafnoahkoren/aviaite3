import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { PaginationDto, PaginatedResponse } from '../dto/pagination.dto';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationFilterDto,
} from '../dto/admin-organization.dto';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
export class AdminOrganizationsService {
  async getOrganizations(
    pagination: PaginationDto,
    filters: OrganizationFilterDto,
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizationWhereInput = {
      deletedAt: null,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              Users: true,
            },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    return {
      data: organizations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrganizationById(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        Users: {
          where: { deletedAt: null },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
            verified: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            Users: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async createOrganization(createDto: CreateOrganizationDto) {
    const organization = await prisma.organization.create({
      data: createDto,
    });

    return organization;
  }

  async updateOrganization(
    organizationId: string,
    updateDto: UpdateOrganizationDto,
  ) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: updateDto,
    });

    return updatedOrganization;
  }

  async deleteOrganization(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Soft delete organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Organization deleted successfully' };
  }

  async getOrganizationStats(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const [
      totalUsers,
      activeUsers,
      totalThreads,
      tokenUsageByModel,
    ] = await Promise.all([
      prisma.user.count({
        where: { organizationId, deletedAt: null },
      }),
      prisma.user.count({
        where: { organizationId, isActive: true, deletedAt: null },
      }),
      prisma.thread.count({
        where: {
          User: { organizationId },
          deletedAt: null,
        },
      }),
      prisma.userTokenUsage.groupBy({
        by: ['modelUsed'],
        where: {
          User: { organizationId },
          deletedAt: null,
        },
        _sum: {
          tokensUsed: true,
          costInCents: true,
        },
      }),
    ]);

    return {
      organizationId,
      organizationName: organization.name,
      totalUsers,
      activeUsers,
      totalThreads,
      tokenUsageByModel: tokenUsageByModel.map(usage => ({
        model: usage.modelUsed,
        totalTokens: usage._sum.tokensUsed || 0,
        totalCostCents: usage._sum.costInCents || 0,
      })),
    };
  }
}