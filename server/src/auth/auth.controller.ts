import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { jwtConfig } from 'src/config/jwt.config';
import { RefreshJwtAuthGuard } from 'src/common/guards/refresh-jwt-auth.guard';
import { RefreshTokenPayload } from './strategies/refresh-jwt-strategy';

interface RequestWithPayload extends Request {
  payload?: RefreshTokenPayload;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.register(registerDto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: jwtConfig.refreshTokenExpiresIn,
    });
    return { data: { accessToken, refreshToken } };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: jwtConfig.refreshTokenExpiresIn,
    });

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
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }
    console.log(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(payload, refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: jwtConfig.refreshTokenExpiresIn,
    });

    return { data: { accessToken, refreshToken: newRefreshToken } };
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: RequestWithPayload,
  ) {
    await this.authService.logout(req.user as RefreshTokenPayload);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return {
      data: null,
      message: 'Logged out',
    };
  }
}
