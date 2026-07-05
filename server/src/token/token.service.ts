import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  private readonly accessTokenExpiresIn = jwtConfig.accessTokenExpiresIn;
  private readonly refreshTokenExpiresIn = jwtConfig.refreshTokenExpiresIn;

  generateAccessToken(user: Omit<User, 'password'>) {
    return {
      accessToken: this.jwtService.sign(
        {
          userId: user.id,
          email: user.email,
        },
        {
          expiresIn: this.accessTokenExpiresIn / 1000, // Convert milliseconds to seconds
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
        { expiresIn: this.refreshTokenExpiresIn / 1000 }, // Convert milliseconds to seconds
      ),
    };
  }
}
