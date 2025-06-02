import { Controller, Post, Body } from '@nestjs/common';
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
} 