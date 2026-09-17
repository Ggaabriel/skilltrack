import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from 'src/event/event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventController } from 'src/event/event.controller';
import { CreateEventDto } from '../dto/create-event.dto';
import { Event } from '../entities/event.entity';
import { UpdateEventDto } from '../dto/update-event.dto';

describe('EventService Integration Tests', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let eventService: EventService;
  let eventController: EventController;

  let user1: { id: number };
  let user2: { id: number };
  const testRunId = Date.now();
  const user1Email = `john.doe.${testRunId}@example.com`;
  const user2Email = `john2.doe.${testRunId}@example.com`;

  let jwtPayload: { userId: number; email: string };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [EventController],
      providers: [PrismaService, EventService],
    }).compile();

    prisma = module.get(PrismaService);
    eventService = module.get(EventService);
    eventController = module.get(EventController);
    await prisma.$connect();

    user1 = await prisma.user.create({
      data: {
        email: user1Email,
        name: 'John Doe',
        password: 'password123',
        picturePath: null,
      },
      select: {
        id: true,
      },
    });
    user2 = await prisma.user.create({
      data: {
        email: user2Email,
        name: 'John Doe',
        password: 'password123',
        picturePath: null,
      },
      select: {
        id: true,
      },
    });

    jwtPayload = {
      userId: user1.id,
      email: user1Email,
    };
  });

  beforeEach(async () => {
    await prisma.event.deleteMany({
      where: { userId: { in: [user1.id, user2.id] } },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [user1.id, user2.id] } },
    });

    await prisma.$disconnect();

    await module.close();
  });

  describe('create event', () => {
    it('should create event', async () => {
      const eventCreateDto: CreateEventDto = {
        title: 'Daily sync',
        description: 'Standup',
        startDate: '2026-09-13T10:15:30.000Z',
        endDate: '2026-09-13T11:15:30.000Z',
        color: 'blue',
      };
      const response = (await eventController.create(
        eventCreateDto,
        jwtPayload,
      )) as { data: Event };
      const event = await eventService.findOne(
        response.data.id,
        jwtPayload.userId,
      );
      expect(response).toEqual({
        data: {
          id: expect.any(Number) as number,
          title: eventCreateDto.title,
          description: eventCreateDto.description,
          startDate: expect.any(Date) as Date,
          endDate: expect.any(Date) as Date,
          color: eventCreateDto.color,
        },
      });

      expect(event).not.toBeNull();
      expect(event?.startDate).toEqual(new Date('2026-09-13T10:15:00.000Z'));
      expect(event?.endDate).toEqual(new Date('2026-09-13T11:15:00.000Z'));
    });
  });

  describe('find one event', () => {
    it('should return an event belonging to the user', async () => {
      const created = await createEvent({ title: 'Planning' });

      await expect(
        eventController.findOne(created.id, jwtPayload),
      ).resolves.toMatchObject({
        id: created.id,
        title: 'Planning',
      });
    });

    it('should reject an event belonging to another user', async () => {
      const created = await createEvent({
        title: 'Private event',
        userId: user2.id,
      });

      await expect(eventService.findOne(created.id, user1.id)).rejects.toThrow(
        'Event not found',
      );
    });
  });

  describe('get user events', () => {
    it('should return events intersecting the requested range in start order', async () => {
      await createEvent({
        title: 'Later',
        startDate: '2026-09-13T12:00:00.000Z',
        endDate: '2026-09-13T13:00:00.000Z',
      });
      await createEvent({
        title: 'Overlapping',
        startDate: '2026-09-13T09:00:00.000Z',
        endDate: '2026-09-13T10:30:00.000Z',
      });
      await createEvent({
        title: 'Other user',
        userId: user2.id,
        startDate: '2026-09-13T09:30:00.000Z',
        endDate: '2026-09-13T10:30:00.000Z',
      });

      await expect(
        eventService.getUserEvents(
          user1.id,
          '2026-09-13T10:00:00.000Z',
          '2026-09-13T12:30:00.000Z',
        ),
      ).resolves.toMatchObject([{ title: 'Overlapping' }, { title: 'Later' }]);
    });

    it('should return null when the user has no events in the range', async () => {
      await expect(
        eventService.getUserEvents(
          user1.id,
          '2026-09-14T00:00:00.000Z',
          '2026-09-14T23:59:00.000Z',
        ),
      ).resolves.toBeNull();
    });
  });

  describe('update event', () => {
    it('should update fields and normalize changed dates', async () => {
      const created = await createEvent({ title: 'Draft' });
      const update: UpdateEventDto = {
        title: 'Published',
        description: 'Ready',
        startDate: '2026-09-13T14:15:45.000Z',
        endDate: '2026-09-13T15:15:45.000Z',
        color: 'green',
      };

      const updated = await eventService.update(created.id, update, user1.id);

      expect(updated).toMatchObject({
        id: created.id,
        title: 'Published',
        description: 'Ready',
        color: 'green',
      });
      expect(updated.startDate).toEqual(new Date('2026-09-13T14:15:00.000Z'));
      expect(updated.endDate).toEqual(new Date('2026-09-13T15:15:00.000Z'));
    });

    it("should reject updating another user's event", async () => {
      const created = await createEvent({ userId: user2.id });

      await expect(
        eventService.update(
          created.id,
          {
            title: 'Hijacked',
            description: null,
            startDate: '2026-09-13T10:00:00.000Z',
            endDate: '2026-09-13T11:00:00.000Z',
            color: 'red',
          },
          user1.id,
        ),
      ).rejects.toThrow();
    });
  });

  describe('remove event', () => {
    it('should delete the event', async () => {
      const created = await createEvent({ title: 'To delete' });

      await expect(
        eventController.remove(created.id, jwtPayload),
      ).resolves.toEqual({ data: null, message: 'Event deleted' });
      await expect(
        prisma.event.findUnique({ where: { id: created.id } }),
      ).resolves.toBeNull();
    });

    it("should reject deleting another user's event", async () => {
      const created = await createEvent({ userId: user2.id });

      await expect(eventService.remove(created.id, user1.id)).rejects.toThrow();
    });
  });

  async function createEvent(
    overrides: Partial<CreateEventDto> & { userId?: number } = {},
  ) {
    const { userId = user1.id, ...event } = overrides;
    return eventService.create({
      userId,
      title: 'Default event',
      description: 'Description',
      startDate: '2026-09-13T10:15:30.000Z',
      endDate: '2026-09-13T11:15:30.000Z',
      color: 'blue',
      ...event,
    });
  }
});
