import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

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
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: RefreshTokenRequest) => request.cookies?.refreshToken ?? null,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: RefreshTokenRequest, payload: RefreshTokenPayload) {
    this.logger.log('Validating refresh token payload', {
      userId: payload.userId,
      sessionId: payload.sessionId,
      hasRefreshCookie: Boolean(request.cookies?.refreshToken),
    });
    return await this.authService.verifyUserRefreshToken(
      payload,
      request.cookies?.refreshToken ?? null,
    );
  }
}
