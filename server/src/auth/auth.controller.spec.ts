import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCookieService } from '../auth-cookie/auth-cookie.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };
  const authCookieService = {
    setRefreshTokenCookie: jest.fn(),
    clearRefreshTokenCookie: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AuthCookieService, useValue: authCookieService },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  beforeEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(controller).toBeDefined());

  it('should register and set the refresh cookie', async () => {
    const dto = { email: 'user@example.com', name: 'User', password: 'pass' };
    authService.register.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    const response = {};

    await expect(controller.register(dto, response as never)).resolves.toEqual({
      data: { accessToken: 'access' },
    });
    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(authCookieService.setRefreshTokenCookie).toHaveBeenCalledWith(
      response,
      'refresh',
    );
  });

  it('should login the request user and set the refresh cookie', async () => {
    const user = { id: 1, email: 'user@example.com' };
    authService.login.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    const response = {};

    await expect(
      controller.login({} as never, response as never, { user } as never),
    ).resolves.toEqual({
      data: { accessToken: 'access' },
    });
    expect(authService.login).toHaveBeenCalledWith(user);
    expect(authCookieService.setRefreshTokenCookie).toHaveBeenCalledWith(
      response,
      'refresh',
    );
  });

  it('should refresh tokens and replace the refresh cookie', async () => {
    const payload = { userId: 1, sessionId: 'session' };
    authService.refresh.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    const response = {};
    const request = { cookies: { refreshToken: 'refresh' }, user: payload };

    await expect(
      controller.refresh(response as never, request as never),
    ).resolves.toEqual({
      data: { accessToken: 'new-access' },
    });
    expect(authService.refresh).toHaveBeenCalledWith(payload, 'refresh');
    expect(authCookieService.setRefreshTokenCookie).toHaveBeenCalledWith(
      response,
      'new-refresh',
    );
  });

  it('should reject refresh when the cookie is missing', async () => {
    await expect(
      controller.refresh({} as never, { cookies: {}, user: {} } as never),
    ).rejects.toThrow('Refresh token not found');
    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('should logout and clear the refresh cookie', async () => {
    const payload = { userId: 1, sessionId: 'session' };
    authService.logout.mockResolvedValue(undefined);
    const response = {};

    await expect(
      controller.logout(response as never, { user: payload } as never),
    ).resolves.toEqual({
      data: null,
      message: 'Logged out',
    });
    expect(authService.logout).toHaveBeenCalledWith(payload);
    expect(authCookieService.clearRefreshTokenCookie).toHaveBeenCalledWith(
      response,
    );
  });
});
