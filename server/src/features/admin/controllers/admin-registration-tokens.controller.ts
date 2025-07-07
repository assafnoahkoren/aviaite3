import {
  Controller,
  Post,
  Get,
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
import { AdminRegistrationTokensService } from '../services/admin-registration-tokens.service';
import { PaginationDto } from '../dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

class GenerateTokenDto {
  @IsOptional()
  @IsString()
  label?: string;
}

@Controller('api/admin/registration-tokens')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminRegistrationTokensController {
  constructor(
    private readonly registrationTokensService: AdminRegistrationTokensService,
  ) {}

  @Post()
  async generateToken(@Body() dto: GenerateTokenDto) {
    return this.registrationTokensService.generateToken(dto.label);
  }

  @Get()
  async getTokens(@Query() pagination: PaginationDto) {
    return this.registrationTokensService.getTokens(pagination);
  }

  @Delete(':tokenId')
  async deleteToken(@Param('tokenId') tokenId: string) {
    return this.registrationTokensService.deleteToken(tokenId);
  }
}
