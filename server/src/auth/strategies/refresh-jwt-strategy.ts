import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';

type RefreshTokenRequest = Request & {
  cookies?: {
    refreshToken?: string;
  };
};

export type RefreshTokenPayload = {
  userId: number; // или number
  sessionId: string; // UUID или number
};
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt', // тут был мем, было напсано наоборот jwt-refresh
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: RefreshTokenRequest) => request.cookies?.refreshToken ?? null,
      ]),
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET || 'default_secret_key',
      passReqToCallback: true,
    });
  }

  async validate(request: RefreshTokenRequest, payload: RefreshTokenPayload) {
    return await this.authService.verifyUserRefreshToken(
      payload,
      request.cookies?.refreshToken ?? null,
    );
  }
}
