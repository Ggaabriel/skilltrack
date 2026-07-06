import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { SessionService } from 'src/session/session.service';
import { TokenService } from 'src/token/token.service';
import { RefreshTokenPayload } from './strategies/refresh-jwt-strategy';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshTokenExpiresIn: number;

  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenExpiresIn = +this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );
  }
  async refresh(payload: RefreshTokenPayload, refreshToken: string) {
    this.logger.log('Refreshing token', {
      userId: payload.userId,
      sessionId: payload.sessionId,
    });

    const session = await this.sessionService.findOne(payload.sessionId);

    const user = await this.userService.findOne(session.userId);

    const valid = await bcrypt.compare(refreshToken, session.refreshToken);
    if (!valid) {
      this.logger.warn('Invalid refresh token supplied', {
        userId: payload.userId,
        sessionId: payload.sessionId,
      });
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
      new Date(Date.now() + this.refreshTokenExpiresIn),
    );

    this.logger.log('Refresh token rotated successfully', {
      userId: payload.userId,
      sessionId: payload.sessionId,
    });

    return { ...newToken, ...newRefreshToken };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const result: Omit<User, 'password'> = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    const sessionId = crypto.randomUUID();
    this.logger.log('Creating login session', { userId: user.id, sessionId });
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(
      user,
      sessionId,
    );
    await this.sessionService.create({
      userId: user.id,
      refreshToken: refreshToken.refreshToken,
      expires: new Date(Date.now() + this.refreshTokenExpiresIn),
      id: sessionId,
    });

    return { ...accessToken, ...refreshToken };
  }

  async register(registerDto: RegisterDto) {
    this.logger.log('Registering new user', { email: registerDto.email });
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
      expires: new Date(Date.now() + this.refreshTokenExpiresIn),
      id: sessionId,
    });

    this.logger.log('User registered and session created', {
      userId: user.id,
      sessionId,
    });

    return { ...accessToken, ...refreshToken };
  }

  async verifyUserRefreshToken(
    payload: RefreshTokenPayload,
    refreshToken: string | null,
  ): Promise<RefreshTokenPayload> {
    try {
      this.logger.log('Validating refresh JWT payload', {
        userId: payload.userId,
        sessionId: payload.sessionId,
      });

      if (!refreshToken) {
        this.logger.warn('Refresh token is missing', {
          userId: payload.userId,
          sessionId: payload.sessionId,
        });
        throw new UnauthorizedException('Refresh token is missing');
      }

      const session = await this.sessionService.findOne(payload.sessionId);

      if (!session || session.userId !== payload.userId) {
        this.logger.warn('Refresh token validation failed, session mismatch', {
          userId: payload.userId,
          sessionId: payload.sessionId,
        });
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        session.refreshToken,
      );
      if (!refreshTokenMatches) {
        this.logger.warn('Refresh token validation failed, token mismatch', {
          userId: payload.userId,
          sessionId: payload.sessionId,
        });
        throw new UnauthorizedException('Refresh token does not match');
      }
      return payload;
    } catch (error) {
      this.logger.error('Refresh token validation error', error);
      throw new UnauthorizedException('Refresh token is not valid');
    }
  }

  async logout(payload: RefreshTokenPayload) {
    this.logger.log('Logging out session', {
      userId: payload.userId,
      sessionId: payload.sessionId,
    });
    const session = await this.sessionService.findOne(payload.sessionId);

    await this.sessionService.delete(session.id);
    this.logger.log('Logout completed', {
      userId: payload.userId,
      sessionId: payload.sessionId,
    });
  }
}
