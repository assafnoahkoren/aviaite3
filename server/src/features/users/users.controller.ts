import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '@features/users/users.service';
import { RegisterDto } from '@features/users/dto/register.dto';
import { LoginDto } from '@features/users/dto/login.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }
} 