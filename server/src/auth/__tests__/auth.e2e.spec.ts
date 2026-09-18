import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { AppModule } from 'src/app.module';
import { configureApp } from 'src/configure-app';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/types/apiResponse';

interface ResponseWithData<T> extends Response {
  body: ApiResponse<T>;
}

describe('Auth E2E', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let email: string;
  let userId: number;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    email = `auth-e2e-${Date.now()}@example.com`;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    }
    await app.close();
  });

  it('should register, login, refresh, and logout a user', async () => {
    const agent = request.agent(app.getHttpServer());
    const password = 'password123';

    const registerResponse: ResponseWithData<{ accessToken: string }> =
      await agent
        .post('/api/auth/register')
        .send({ email, name: 'Auth E2E User', password })
        .expect(201);

    expect(registerResponse.body.ok).toBe(true);
    expect(registerResponse.body.data.accessToken).toEqual(expect.any(String));
    expect(registerResponse.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    );

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    expect(user).not.toBeNull();
    userId = user!.id;

    const loginResponse: ResponseWithData<{ accessToken: string }> = await agent
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);

    expect(loginResponse.body.ok).toBe(true);
    expect(loginResponse.body.data.accessToken).toEqual(expect.any(String));

    const refreshResponse: ResponseWithData<{ accessToken: string }> =
      await agent.post('/api/auth/refresh').expect(201);

    expect(refreshResponse.body.ok).toBe(true);
    expect(refreshResponse.body.data.accessToken).toEqual(expect.any(String));

    const logoutResponse: ResponseWithData<null> = await agent
      .post('/api/auth/logout')
      .expect(201);

    expect(logoutResponse.body.ok).toBe(true);
    expect(logoutResponse.body.data).toBeNull();
    expect(logoutResponse.body.message).toBe('Logged out');
  });
});
