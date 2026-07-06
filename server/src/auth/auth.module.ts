import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { SessionModule } from 'src/session/session.module';
import { JwtStrategy } from './strategies/jwt-strategy';
import { TokenModule } from 'src/token/token.module';
import { JwtRefreshStrategy } from './strategies/refresh-jwt-strategy';
import { AuthCookieModule } from 'src/auth-cookie/auth-cookie.module';
import { LocalStrategy } from './strategies/local-strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, LocalStrategy],
  imports: [UserModule, SessionModule, TokenModule, AuthCookieModule],
})
export class AuthModule {}
