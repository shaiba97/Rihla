import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { PrismaModule } from '@app/prisma';

@Global()
@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'rihla_super_secret_jwt_key_2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, JwtAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, PassportModule],
})
export class AuthModule {}