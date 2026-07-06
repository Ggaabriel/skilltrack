import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import type { Request, Response } from 'express';
import { RefreshJwtAuthGuard } from 'src/common/guards/refresh-jwt-auth.guard';
import { RefreshTokenPayload } from './strategies/refresh-jwt-strategy';
import { AuthCookieService } from 'src/auth-cookie/auth-cookie.service';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { LoginDto } from './dto/login.dto';

interface RequestWithPayload extends Request {
  payload?: RefreshTokenPayload;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private authCookieService: AuthCookieService,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('Register request', { email: registerDto.email });
    const { accessToken, refreshToken } =
      await this.authService.register(registerDto);
    this.authCookieService.setRefreshTokenCookie(res, refreshToken);
    this.logger.log('User registered successfully', {
      email: registerDto.email,
    });
    return { data: { accessToken, refreshToken } };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request & { user: User },
  ) {
    this.logger.log('Login request', {
      email: req.user.email,
      userId: req.user.id,
    });
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );
    this.authCookieService.setRefreshTokenCookie(res, refreshToken);
    this.logger.log('Login successful', { userId: req.user.id });

    return { data: { accessToken, refreshToken } };
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: RequestWithPayload,
  ) {
    const refreshToken = req.cookies.refreshToken as string;
    const payload = req.user as RefreshTokenPayload;
    this.logger.log('Refresh request received', {
      userId: payload?.userId,
      sessionId: payload?.sessionId,
    });
    if (!refreshToken) {
      this.logger.error('Refresh token not found', {
        userId: payload?.userId,
        sessionId: payload?.sessionId,
      });
      throw new Error('Refresh token not found');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(payload, refreshToken);

    this.authCookieService.setRefreshTokenCookie(res, newRefreshToken);
    this.logger.log('Refresh token rotated successfully', {
      userId: payload.userId,
      sessionId: payload.sessionId,
    });

    return { data: { accessToken, refreshToken: newRefreshToken } };
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: RequestWithPayload,
  ) {
    const payload = req.user as RefreshTokenPayload;
    this.logger.log('Logout request', {
      userId: payload?.userId,
      sessionId: payload?.sessionId,
    });
    await this.authService.logout(payload);
    this.authCookieService.clearRefreshTokenCookie(res);
    this.logger.log('Logout successful', {
      userId: payload?.userId,
      sessionId: payload?.sessionId,
    });

    return {
      data: null,
      message: 'Logged out',
    };
  }
}
