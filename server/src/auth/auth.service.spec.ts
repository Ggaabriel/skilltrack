import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { TokenService } from '../token/token.service';
import { ConfigService } from '@nestjs/config';
import { jest } from '@jest/globals';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  const user = {
    id: 1,
    email: 'john.doe@example.com',
    name: 'john',
    picturePath: null,
    password: 'password123',
  };

  const session = {
    refreshToken: 'refreshToken',
    id: '1',
    userId: 1,
    expires: new Date(),
    userAgent: null,
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  let service: AuthService;

  const accessToken = {
    accessToken: 'accessToken',
  };

  const refreshToken = {
    refreshToken: 'refreshToken',
  };

  const tokenService = {
    generateAccessToken: jest.fn().mockReturnValue(accessToken),
    generateRefreshToken: jest.fn().mockReturnValue(refreshToken),
  };

  const sessionService = {
    findOne: jest
      .fn<() => Promise<typeof session>>()
      .mockResolvedValue(session),
    create: jest.fn<() => Promise<typeof session>>().mockResolvedValue(session),
  };

  const configService = {
    getOrThrow: jest.fn<() => Promise<number>>().mockResolvedValue(3600),
  };

  const userService = {
    findOne: jest.fn<() => Promise<typeof user>>().mockResolvedValue(user),
    create: jest.fn<() => Promise<typeof user>>().mockResolvedValue(user),
  };

  const payload = {
    userId: 1,
    sessionId: '1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
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

  it('login working', async () => {
    const result = await service.login(user);

    expect(result).toEqual({ ...accessToken, ...refreshToken });

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
      user,
      expect.any(String),
    );
    expect(sessionService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        refreshToken: refreshToken.refreshToken,
      }),
    );
  });

  it('should throw an error if session creation fails', async () => {
    sessionService.create.mockRejectedValueOnce(
      Error('Failed to create session'),
    );

    await expect(service.login(user)).rejects.toThrow(
      'Failed to create session',
    );
  });

  it('register working', async () => {
    const registerDto = {
      email: 'john.doe@example.com',
      password: 'password123',
      name: 'John Doe',
    };

    const result = await service.register(registerDto);

    expect(result).toEqual({ ...accessToken, ...refreshToken });

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
      user,
      expect.any(String),
    );
    expect(userService.create).toHaveBeenCalledWith(registerDto);
    expect(sessionService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        refreshToken: refreshToken.refreshToken,
      }),
    );
  });

  it('verifyUserRefreshToken working', async () => {
    const token = 'refreshToken';
    const hash = await bcrypt.hash(token, 10);

    sessionService.findOne.mockResolvedValueOnce({
      ...session,
      refreshToken: hash,
    });

    const result = await service.verifyUserRefreshToken(payload, token);

    expect(result).toEqual(payload);

    expect(sessionService.findOne).toHaveBeenCalledWith(payload.sessionId);
  });

  // it('Refresh token is missing', async () => {
  //   await expect(service.verifyUserRefreshToken(payload, null)).rejects.toThrow(
  //     'Refresh token is not valid',
  //   );
  // });
});
