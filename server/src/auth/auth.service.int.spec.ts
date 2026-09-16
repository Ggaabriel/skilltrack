import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { TokenService } from '../token/token.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenPayload } from './strategies/refresh-jwt-strategy';

describe('AuthService Integration Tests', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let userService: UserService;
  let authService: AuthService;
  const testRunId = Date.now();
  const createdUserIds: number[] = [];

  const configService = {
    getOrThrow: (key: string) => {
      if (key === 'jwt') {
        return {
          accessSecret: 'integration-access-secret',
          refreshSecret: 'integration-refresh-secret',
          accessExpiresIn: 3_600_000,
          refreshExpiresIn: 3_600_000,
        };
      }
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '3600000';
      throw new Error(`Unexpected config key: ${key}`);
    },
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        PrismaService,
        UserService,
        SessionService,
        TokenService,
        AuthService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    prisma = module.get(PrismaService);
    userService = module.get(UserService);
    authService = module.get(AuthService);
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.session.deleteMany({
      where: { userId: { in: createdUserIds } },
    });
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    await prisma.$disconnect();
    await module.close();
  });

  it('should register a user and persist a session', async () => {
    const dto = registerDto('register');

    const result = await authService.register(dto);
    const user = await userService.findByEmail(dto.email);
    createdUserIds.push(user.id);
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
    });

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(sessions).toHaveLength(1);
    expect(sessions[0].userId).toBe(user.id);
  });

  it('should validate credentials against the persisted password', async () => {
    const dto = registerDto('validate');
    const user = await userService.create(dto);
    createdUserIds.push(user.id);

    await expect(
      authService.validateUser(dto.email, dto.password),
    ).resolves.toMatchObject({ id: user.id, email: dto.email });
    await expect(
      authService.validateUser(dto.email, 'wrong-password'),
    ).resolves.toBeNull();
  });

  it('should login and rotate a refresh session', async () => {
    const dto = registerDto('login');
    const created = await userService.create(dto);
    createdUserIds.push(created.id);
    const user = await userService.findByEmail(dto.email);
    const result = await authService.login(user);
    const session = (
      await prisma.session.findMany({
        where: { userId: user.id },
      })
    )[0];
    const payload: RefreshTokenPayload = {
      userId: user.id,
      sessionId: session.id,
    };

    await expect(
      authService.verifyUserRefreshToken(payload, result.refreshToken),
    ).resolves.toEqual(payload);
    const refreshed = await authService.refresh(payload, result.refreshToken);

    expect(refreshed.accessToken).toEqual(expect.any(String));
    expect(refreshed.refreshToken).toEqual(expect.any(String));
    await expect(authService.logout(payload)).resolves.toBeUndefined();
    await expect(
      prisma.session.findUnique({ where: { id: session.id } }),
    ).resolves.toBeNull();
  });

  it('should reject a missing or invalid refresh token', async () => {
    const dto = registerDto('refresh-error');
    const created = await userService.create(dto);
    createdUserIds.push(created.id);
    const result = await authService.login(
      await userService.findByEmail(dto.email),
    );
    const session = (
      await prisma.session.findMany({
        where: { userId: created.id },
      })
    )[0];
    const payload: RefreshTokenPayload = {
      userId: created.id,
      sessionId: session.id,
    };

    await expect(
      authService.verifyUserRefreshToken(payload, null),
    ).rejects.toThrow('Refresh token is missing');
    await expect(
      authService.verifyUserRefreshToken(payload, 'invalid-refresh-token'),
    ).rejects.toThrow('Refresh token does not match');
  });

  function registerDto(label: string): RegisterDto {
    return {
      email: `${label}.${testRunId}@example.com`,
      name: `${label} user`,
      password: 'password123',
    };
  }
});
