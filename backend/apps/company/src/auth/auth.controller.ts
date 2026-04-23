import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { UserWithoutPassword } from '../users/entity/user.entity';
import { UsersService } from '../users/service/users.service';

@ApiTags('api/auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('post-login')
  @UseGuards(AuthGuard('local'))
  login(@Req() req: Request & { user: UserWithoutPassword }) {
    return this.usersService.login(req.user);
  }
}
