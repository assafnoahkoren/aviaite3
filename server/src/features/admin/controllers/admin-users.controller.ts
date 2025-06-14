import {
  Controller,
  Get,
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
import { AdminUsersService } from '../services/admin-users.service';
import { PaginationDto } from '../dto/pagination.dto';
import { UpdateUserDto, UserFilterDto } from '../dto/admin-user.dto';

@Controller('api/admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getUsers(
    @Query() pagination: PaginationDto,
    @Query() filters: UserFilterDto,
  ) {
    return this.adminUsersService.getUsers(pagination, filters);
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    return this.adminUsersService.getUserById(userId);
  }

  @Get(':userId/stats')
  async getUserStats(@Param('userId') userId: string) {
    return this.adminUsersService.getUserStats(userId);
  }

  @Patch(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.adminUsersService.updateUser(userId, updateDto);
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string) {
    return this.adminUsersService.deleteUser(userId);
  }
}