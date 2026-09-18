import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { configureApp } from 'src/configure-app';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/types/apiResponse';
import request, { Response } from 'supertest';
import { Event } from '../entities/event.entity';

interface ResponseWithData<T> extends Response {
  body: ApiResponse<T>;
}

describe('Event E2E', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  let accessToken: string;
  let userId: number;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication({ logger: false });

    configureApp(app);

    await app.init();

    prisma = app.get(PrismaService);

    const email = `event-e2e-${Date.now()}@example.com`;

    const response: ResponseWithData<{ accessToken: string }> = await request(
      app.getHttpServer(),
    )
      .post('/api/auth/register')
      .send({
        email,
        name: 'E2E Test_Panda',
        password: 'password123',
      })
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

  beforeEach(async () => {
    await prisma.event.deleteMany({
      where: { userId },
    });
  });

  afterAll(async () => {
    await prisma.event.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    await app.close();
  });

  describe('POST /event', () => {
    it('should create event', async () => {
      const response: ResponseWithData<Omit<Event, 'userId'>> = await request(
        app.getHttpServer(),
      )
        .post('/api/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Daily sync',
          description: 'Standup',
          startDate: '2026-09-13T10:15:30.000Z',
          endDate: '2026-09-13T11:15:30.000Z',
          color: 'blue',
        })
        .expect(201);

      expect(response.body.ok).toBe(true);
      expect(response.body.status).toBe(201);

      expect(typeof response.body.data.id).toBe('number');

      expect(response.body.data).toMatchObject({
        title: 'Daily sync',
        description: 'Standup',
        color: 'blue',
      });

      expect(new Date(response.body.data.startDate)).toEqual(
        new Date('2026-09-13T10:15:00.000Z'),
      );

      expect(new Date(response.body.data.endDate)).toEqual(
        new Date('2026-09-13T11:15:00.000Z'),
      );

      const eventId = response.body.data.id;

      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

      expect(event).not.toBeNull();
      expect(event?.userId).toBe(userId);
      expect(event?.title).toBe('Daily sync');
      expect(event?.description).toBe('Standup');
      expect(event?.color).toBe('blue');
    });
  });

  describe('GET /event/:id', () => {
    it('should get event by id', async () => {
      const event = await prisma.event.create({
        data: {
          userId,
          title: 'Daily sync',
          description: 'Standup',
          startDate: new Date('2026-09-13T10:15:00.000Z'),
          endDate: new Date('2026-09-13T11:15:00.000Z'),
          color: 'blue',
        },
      });

      const response: ResponseWithData<Event> = await request(
        app.getHttpServer(),
      )
        .get(`/api/event/${event.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.status).toBe(200);

      expect(response.body.data).toMatchObject({
        id: event.id,
        title: 'Daily sync',
        description: 'Standup',
        color: 'blue',
      });

      expect(new Date(response.body.data.startDate)).toEqual(
        new Date('2026-09-13T10:15:00.000Z'),
      );

      expect(new Date(response.body.data.endDate)).toEqual(
        new Date('2026-09-13T11:15:00.000Z'),
      );
    });
  });

  describe('PATCH /event/:id', () => {
    it('should update event', async () => {
      const event = await prisma.event.create({
        data: {
          userId,
          title: 'Old title',
          description: 'Old description',
          startDate: new Date('2026-09-13T10:15:00.000Z'),
          endDate: new Date('2026-09-13T11:15:00.000Z'),
          color: 'blue',
        },
      });

      const response: ResponseWithData<Event> = await request(
        app.getHttpServer(),
      )
        .patch(`/api/event/${event.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated title',
          color: 'red',
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.status).toBe(200);

      expect(response.body.data).toMatchObject({
        id: event.id,
        title: 'Updated title',
        description: 'Old description',
        color: 'red',
      });

      const updatedEvent = await prisma.event.findUnique({
        where: {
          id: event.id,
        },
      });

      expect(updatedEvent).not.toBeNull();
      expect(updatedEvent?.title).toBe('Updated title');
      expect(updatedEvent?.description).toBe('Old description');
      expect(updatedEvent?.color).toBe('red');
    });
  });

  describe('DELETE /event/:id', () => {
    it('should delete event', async () => {
      const event = await prisma.event.create({
        data: {
          userId,
          title: 'Event to delete',
          description: 'Description',
          startDate: new Date('2026-09-13T10:15:00.000Z'),
          endDate: new Date('2026-09-13T11:15:00.000Z'),
          color: 'blue',
        },
      });

      const response: ResponseWithData<null> = await request(
        app.getHttpServer(),
      )
        .delete(`/api/event/${event.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Event deleted');

      const deletedEvent = await prisma.event.findUnique({
        where: {
          id: event.id,
        },
      });

      expect(deletedEvent).toBeNull();
    });

    it('should return 404 when deleting nonexistent event', async () => {
      const nonexistentEventId = 999999999;

      const response: ResponseWithData<null> = await request(
        app.getHttpServer(),
      )
        .delete(`/api/event/${nonexistentEventId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.ok).toBe(false);
      expect(response.body.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('GET /event/:id after deletion', () => {
    it('should return 403 when getting deleted event', async () => {
      const event = await prisma.event.create({
        data: {
          userId,
          title: 'Event to delete',
          description: 'Description',
          startDate: new Date('2026-09-13T10:15:00.000Z'),
          endDate: new Date('2026-09-13T11:15:00.000Z'),
          color: 'blue',
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/event/${event.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const response: ResponseWithData<null> = await request(
        app.getHttpServer(),
      )
        .get(`/api/event/${event.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body.ok).toBe(false);
      expect(response.body.status).toBe(403);
      expect(response.body.message).toBe('Event not found');
    });
  });
});
