import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { TokenService } from '../token/token.service';
import { ConfigService } from '@nestjs/config';
import { jest } from '@jest/globals';

describe('AuthService', () => {
  let service: AuthService;

  const accessToken = {
    accessToken: 'accessToken',
  };

  const refreshToken = {
    refreshToken: 'refreshToken',
  };

  const tokenService = {
    generateAccessToken: jest.fn().mockResolvedValue(accessToken),
    generateRefreshToken: jest.fn().mockResolvedValue(refreshToken),
  };

  const sessionService = {
    create: jest.fn().mockResolvedValue(undefined),
  };

  const configService = {
    getOrThrow: jest.fn().mockResolvedValue(3600),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: {} },
        { provide: SessionService, useValue: sessionService },
        { provide: TokenService, useValue: tokenService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('login working', async () => {
  //   const user = {
  //     id: 1,
  //     email: 'john.doe@example.com',
  //     name: 'john',
  //     picturePath: null,
  //     password: 'password123',
  //   };

  //   const result = await service.login(user);

  //   expect(result).toEqual({ ...accessToken, ...refreshToken });

  //   expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);
  //   expect(tokenService.generateRefreshToken).toHaveBeenCalled();
  //   expect(sessionService.create).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       userId: user.id,
  //       refreshToken: refreshToken.refreshToken,
  //     }),
  //   );
  // });
  it('login works', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      name: 'john',
      picturePath: null,
    };

    const accessToken = {
      accessToken: 'access-token',
    };

    const refreshToken = {
      refreshToken: 'refresh-token',
    };

    const tokenService = {
      generateAccessToken: jest.fn().mockReturnValue(accessToken),
      generateRefreshToken: jest.fn().mockReturnValue(refreshToken),
    };

    const sessionService = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: {} },
        { provide: SessionService, useValue: sessionService },
        { provide: TokenService, useValue: tokenService },
        { provide: ConfigService, useValue: { getOrThrow: () => '1' } },
      ],
    }).compile();

    const service = module.get(AuthService);

    const result = await service.login(user);

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);

    expect(tokenService.generateRefreshToken).toHaveBeenCalled();

    expect(sessionService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        refreshToken: 'refresh-token',
      }),
    );
  });
});
