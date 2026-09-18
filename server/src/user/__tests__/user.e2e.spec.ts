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

describe('User E2E', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let accessToken: string;
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

    email = `user-e2e-${Date.now()}@example.com`;
    const response: ResponseWithData<{ accessToken: string }> = await request(
      app.getHttpServer(),
    )
      .post('/api/auth/register')
      .send({ email, name: 'User E2E User', password: 'password123' })
      .expect(201);

    accessToken = response.body.data.accessToken;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      throw new Error('E2E user was not created');
    }
    userId = user.id;
  });

  afterAll(async () => {
    try {
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        if (user) {
          await prisma.user.delete({ where: { id: userId } });
        }
      }
    } finally {
      await app.close();
    }
  });

  it('should get the current user profile', async () => {
    const response: ResponseWithData<{
      email: string;
      name: string;
      picturePath: string | null;
    }> = await request(app.getHttpServer())
      .get('/api/user/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.data).toMatchObject({
      email,
      name: 'User E2E User',
      picturePath: null,
    });
    expect(response.body.data).not.toHaveProperty('id');
  });

  it('should update the current user', async () => {
    const response: ResponseWithData<{
      id: number;
      email: string;
      name: string;
      picturePath: string | null;
    }> = await request(app.getHttpServer())
      .patch('/api/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email,
        name: 'Updated User',
        password: 'newpassword',
      })
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.data).toMatchObject({
      id: userId,
      email,
      name: 'Updated User',
      picturePath: null,
    });
  });

  it('should list users for an authenticated user', async () => {
    const response: ResponseWithData<
      Array<{ id: number; email: string; name: string }>
    > = await request(app.getHttpServer())
      .get('/api/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: userId, email, name: 'Updated User' }),
      ]),
    );
    expect(response.body.meta).toEqual(
      expect.objectContaining({ page: 1, total: expect.any(Number) }),
    );
  });

  it('should delete the current user', async () => {
    const response: ResponseWithData<unknown> = await request(
      app.getHttpServer(),
    )
      .delete('/api/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.status).toBe(200);

    await expect(
      prisma.user.findUnique({ where: { id: userId } }),
    ).resolves.toBeNull();
    userId = 0;
  });
});
