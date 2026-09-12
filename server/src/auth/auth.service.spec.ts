import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { TokenService } from '../token/token.service';
import { ConfigService } from '@nestjs/config';
import { jest } from '@jest/globals';
import type { AuthService as AuthServiceType } from './auth.service';
import { RefreshTokenPayload } from './strategies/refresh-jwt-strategy';

const compareMock =
  jest.fn<(data: string, encrypted: string) => Promise<boolean>>();

jest.unstable_mockModule('bcrypt', () => ({
  compare: compareMock,
}));

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

  const accessToken = {
    accessToken: 'accessToken',
  };

  const refreshToken = {
    refreshToken: 'refreshToken',
  };

  const invalidRefreshToken = {
    refreshToken: 'invalidRefreshToken',
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

    rotate: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),

    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };

  const configService = {
    getOrThrow: jest.fn<() => string>().mockReturnValue('3600'),
  };

  const userService = {
    findOne: jest.fn<() => Promise<typeof user>>().mockResolvedValue(user),
    findByEmail: jest.fn<() => Promise<typeof user>>().mockResolvedValue(user),
    create: jest.fn<() => Promise<typeof user>>().mockResolvedValue(user),
  };

  const payload = {
    userId: 1,
    sessionId: '1',
  };

  let service: AuthServiceType;

  beforeAll(async () => {
    const authServiceSrc = './auth.service';
    const authModule = (await import(
      authServiceSrc
    )) as typeof import('./auth.service');
    const { AuthService: AuthServiceClass } = authModule;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServiceClass,
        { provide: UserService, useValue: userService },
        { provide: SessionService, useValue: sessionService },
        { provide: TokenService, useValue: tokenService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthServiceType>(AuthServiceClass);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    compareMock.mockResolvedValue(true);

    sessionService.findOne.mockResolvedValue(session);
    sessionService.create.mockResolvedValue(session);
    userService.findOne.mockResolvedValue(user);
    userService.create.mockResolvedValue(user);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return tokens and create session', async () => {
      const result = await service.login(user);

      expect(result).toEqual({
        ...accessToken,
        ...refreshToken,
      });

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
  });

  describe('register', () => {
    it('should return tokens and create session', async () => {
      const registerDto = {
        email: 'john.doe@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      const result = await service.register(registerDto);

      expect(result).toEqual({
        ...accessToken,
        ...refreshToken,
      });

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
  });

  describe('verifyUserRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      const result = await service.verifyUserRefreshToken(
        payload,
        refreshToken.refreshToken,
      );

      expect(result).toEqual(payload);

      expect(sessionService.findOne).toHaveBeenCalledWith(payload.sessionId);

      expect(compareMock).toHaveBeenCalledWith(
        refreshToken.refreshToken,
        session.refreshToken,
      );
    });

    it('should throw when refresh token is missing', async () => {
      await expect(
        service.verifyUserRefreshToken(payload, null),
      ).rejects.toThrow('Refresh token is missing');

      expect(compareMock).not.toHaveBeenCalled();
    });

    it('should throw when session user does not match payload', async () => {
      const mismatchedPayload = {
        userId: 2,
        sessionId: '1',
      };

      sessionService.findOne.mockResolvedValueOnce({
        ...session,
        userId: 1,
      });

      await expect(
        service.verifyUserRefreshToken(
          mismatchedPayload,
          invalidRefreshToken.refreshToken,
        ),
      ).rejects.toThrow('Invalid refresh token');

      expect(compareMock).not.toHaveBeenCalled();
    });

    it('should throw when refresh token does not match', async () => {
      compareMock.mockResolvedValueOnce(false);

      await expect(
        service.verifyUserRefreshToken(
          payload,
          invalidRefreshToken.refreshToken,
        ),
      ).rejects.toThrow('Refresh token does not match');

      expect(compareMock).toHaveBeenCalledWith(
        invalidRefreshToken.refreshToken,
        session.refreshToken,
      );
    });

    it('should throw when payload not valid or refresh token is not valid', async () => {
      await expect(
        service.verifyUserRefreshToken(
          null as unknown as RefreshTokenPayload,
          refreshToken.refreshToken,
        ),
      ).rejects.toThrow('Payload not valid or refresh token is not valid');

      expect(compareMock).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should return new refreshToken+accessToken', async () => {
      const result = await service.refresh(payload, refreshToken.refreshToken);

      expect(result).toEqual({ ...accessToken, ...refreshToken });

      expect(sessionService.findOne).toHaveBeenCalledWith(payload.sessionId);
      expect(userService.findOne).toHaveBeenCalledWith(session.userId);
      expect(compareMock).toHaveBeenCalledWith(
        refreshToken.refreshToken,
        session.refreshToken,
      );
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);
      expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
        user,
        payload.sessionId,
      );
      expect(sessionService.rotate).toHaveBeenCalledWith(
        payload.sessionId,
        refreshToken.refreshToken,
        expect.any(Date),
      );
    });

    it('should throw an error if refresh token is invalid', async () => {
      compareMock.mockResolvedValueOnce(false);

      await expect(
        service.refresh(payload, invalidRefreshToken.refreshToken),
      ).rejects.toThrow('Invalid refresh token');

      expect(sessionService.findOne).toHaveBeenCalledWith(payload.sessionId);
      expect(userService.findOne).toHaveBeenCalledWith(session.userId);
      expect(compareMock).toHaveBeenCalledWith(
        invalidRefreshToken.refreshToken,
        session.refreshToken,
      );
      expect(sessionService.rotate).not.toHaveBeenCalled();
      expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
      expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user if valid credentials', async () => {
      compareMock.mockResolvedValueOnce(true);

      const result = await service.validateUser(user.email, user.password);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        picturePath: user.picturePath,
        password: user.password,
      });

      expect(userService.findByEmail).toHaveBeenCalledWith(user.email);
      expect(compareMock).toHaveBeenCalledWith(user.password, user.password);
    });

    it('should return null if invalid credentials', async () => {
      compareMock.mockResolvedValueOnce(false);

      const result = await service.validateUser(user.email, 'wrongPassword');

      expect(result).toBeNull();

      expect(userService.findByEmail).toHaveBeenCalledWith(user.email);
      expect(compareMock).toHaveBeenCalledWith('wrongPassword', user.password);
    });
  });

  describe('logout', () => {
    it('should delete the session and return undefined', async () => {
      const result = await service.logout(payload);

      expect(result).toBeUndefined();

      expect(sessionService.delete).toHaveBeenCalledWith(payload.sessionId);
    });
  });
});
