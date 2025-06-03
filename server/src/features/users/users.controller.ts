import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UsersService } from '@features/users/users.service';
import { RegisterDto } from '@features/users/dto/register.dto';
import { LoginDto } from '@features/users/dto/login.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('api/users/register')
  async register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  @Post('api/users/login')
  async login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Get('api/users/verify')
  async verify(@Query('userId') userId: string, @Query('token') token: string) {
    return this.usersService.verify(userId, token);
  }

  @Post('api/users/reset-password-token')
  async createResetPasswordToken(@Body('email') email: string) {
    return this.usersService.createResetPasswordToken(email);
  }

  @Post('api/users/reset-password')
  async resetPassword(
    @Body('userId') userId: string,
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.resetPassword(userId, token, newPassword);
  }
} 