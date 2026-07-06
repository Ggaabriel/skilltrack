import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from 'src/config/jwt.config';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TokenService {
  private readonly jwt: JwtConfig;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwt = this.configService.getOrThrow<JwtConfig>('jwt');
  }

  generateAccessToken(user: Omit<User, 'password'>) {
    return {
      accessToken: this.jwtService.sign(
        {
          userId: user.id,
          email: user.email,
        },
        {
          secret: this.jwt.accessSecret,
          expiresIn: this.jwt.accessExpiresIn / 1000, // Convert milliseconds to seconds
        },
      ),
    };
  }

  generateRefreshToken(user: Omit<User, 'password'>, sessionId: string) {
    return {
      refreshToken: this.jwtService.sign(
        {
          userId: user.id,
          sessionId,
        },
        {
          secret: this.jwt.refreshSecret,
          expiresIn: this.jwt.refreshExpiresIn / 1000, // Convert milliseconds to seconds
        },
      ),
    };
  }
}
