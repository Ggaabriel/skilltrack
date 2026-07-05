import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SessionService } from 'src/session/session.service';
import { TokenService } from 'src/token/token.service';
import { jwtConfig } from 'src/config/jwt.config';
import { RefreshTokenPayload } from './strategies/refresh-jwt-strategy';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private readonly tokenService: TokenService,
  ) {}
  async refresh(payload: RefreshTokenPayload, refreshToken: string) {
    const session = await this.sessionService.findOne(payload.sessionId);

    const user = await this.userService.findOne(session.userId);

    const valid = await bcrypt.compare(refreshToken, session.refreshToken);
    if (!valid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newToken = this.tokenService.generateAccessToken(user);
    const newRefreshToken = this.tokenService.generateRefreshToken(
      user,
      session.id,
    );

    await this.sessionService.rotate(
      session.id,
      newRefreshToken.refreshToken,
      new Date(Date.now() + jwtConfig.refreshTokenExpiresIn),
    );

    return { ...newToken, ...newRefreshToken };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const sessionId = crypto.randomUUID();
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(
      user,
      sessionId,
    );
    await this.sessionService.create({
      userId: user.id,
      refreshToken: refreshToken.refreshToken,
      expires: new Date(Date.now() + jwtConfig.refreshTokenExpiresIn),
      id: sessionId,
    });

    return { ...accessToken, ...refreshToken };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    const accessToken = this.tokenService.generateAccessToken(user);
    const sessionId = crypto.randomUUID();
    const refreshToken = this.tokenService.generateRefreshToken(
      user,
      sessionId,
    );
    await this.sessionService.create({
      userId: user.id,
      refreshToken: refreshToken.refreshToken,
      expires: new Date(Date.now() + jwtConfig.refreshTokenExpiresIn),
      id: sessionId,
    });

    return { ...accessToken, ...refreshToken };
  }

  async verifyUserRefreshToken(
    payload: RefreshTokenPayload,
    refreshToken: string | null,
  ): Promise<RefreshTokenPayload> {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is missing');
      }

      const session = await this.sessionService.findOne(payload.sessionId);

      if (!session || session.userId !== payload.userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        session.refreshToken,
      );
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Refresh token does not match');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token is not valid');
    }
  }

  async logout(payload: RefreshTokenPayload) {
    const session = await this.sessionService.findOne(payload.sessionId);

    await this.sessionService.delete(session.id);
  }
}
