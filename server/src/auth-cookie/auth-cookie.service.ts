import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

@Injectable()
export class AuthCookieService {
  private readonly isProduction: boolean;
  private readonly refreshTokenExpiresIn: number;
  private readonly refreshTokenCookieOptions: CookieOptions;
  constructor(private readonly configService: ConfigService) {
    this.isProduction =
      this.configService.getOrThrow<string>('NODE_ENV') === 'production';
    this.refreshTokenExpiresIn = this.configService.getOrThrow<number>(
      'JWT_REFRESH_EXPIRES_IN',
    );
    this.refreshTokenCookieOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      maxAge: this.refreshTokenExpiresIn,
    };
  }
  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, this.refreshTokenCookieOptions);
  }

  clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken', this.refreshTokenCookieOptions);
  }
}
