import { jest } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import type { EventService as EventServiceType } from './event.service';
import { EventService } from './event.service';
import type { UpdateEventDto } from './dto/update-event.dto';
import type { Event as EventEntity } from './entities/event.entity';
import type { TEventColor } from './types/event-color.type';

type EventSelect = {
  id: true;
  title: true;
  description: true;
  startDate: true;
  endDate: true;
  color: true;
};

type EventProjection = {
  id: number;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  color: TEventColor;
};

type EventCreateInput = Omit<EventEntity, 'id'>;

type EventArg = {
  userId: number;
  AND: Array<{ startDate: { lte: Date } } | { endDate: { gte: Date } }>;
};

const prisma = {
  event: {
    create:
      jest.fn<
        (args: {
          data: EventCreateInput;
          select: EventSelect;
        }) => Promise<EventProjection>
      >(),

    findMany:
      jest.fn<
        (args: {
          where: EventArg;
          select: EventSelect;
          orderBy: { startDate: 'asc' };
        }) => Promise<EventProjection[]>
      >(),

    findUnique:
      jest.fn<
        (args: {
          where: { id: number; userId: number };
          select: EventSelect;
        }) => Promise<EventProjection | null>
      >(),

    update: jest.fn<
      (args: {
        where: { id: number; userId: number };
        data: Partial<UpdateEventDto> & {
          startDate?: Date | string;
          endDate?: Date | string;
        };
        select: EventSelect;
      }) => Promise<EventProjection>
    >(),

    delete:
      jest.fn<
        (args: {
          where: { id: number; userId: number };
          select: EventSelect;
        }) => Promise<EventProjection>
      >(),
  },
};

describe('EventService', () => {
  let service: EventServiceType;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<EventServiceType>(EventService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('creates event with normalized dates and returns selected fields', async () => {
      const input: EventCreateInput = {
        title: 'Daily sync',
        description: 'Standup',
        startDate: '2026-09-13T10:15:30.000Z',
        endDate: '2026-09-13T11:15:30.000Z',
        color: 'blue',
        userId: 123,
      };

      const created: EventProjection = {
        id: 1,
        title: input.title,
        description: input.description,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        color: input.color,
      };

      prisma.event.create.mockResolvedValue(created);

      const result = await service.create(input);

      expect(prisma.event.create).toHaveBeenCalledTimes(1);

      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            color: true,
          },
        }),
      );

      const callArgs = prisma.event.create.mock.calls[0]?.[0];

      expect(callArgs).toBeDefined();

      if (!callArgs) {
        throw new Error('create must be called');
      }

      const normalizedStartDate = callArgs.data.startDate as unknown as Date;
      const normalizedEndDate = callArgs.data.endDate as unknown as Date;

      expect(normalizedStartDate).toBeInstanceOf(Date);
      expect(normalizedEndDate).toBeInstanceOf(Date);

      expect(normalizedStartDate.getSeconds()).toBe(0);
      expect(normalizedEndDate.getSeconds()).toBe(0);

      expect(normalizedStartDate.getMilliseconds()).toBe(0);
      expect(normalizedEndDate.getMilliseconds()).toBe(0);

      expect(result).toEqual(created);
    });

    it('propagates prisma.create failure', async () => {
      const input: EventCreateInput = {
        title: 'Daily sync',
        description: 'Standup',
        startDate: '2026-09-13T10:15:30.000Z',
        endDate: '2026-09-13T11:15:30.000Z',
        color: 'blue',
        userId: 123,
      };

      prisma.event.create.mockRejectedValue(new Error('database down'));

      await expect(service.create(input)).rejects.toThrow('database down');

      expect(prisma.event.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserEvents()', () => {
    it('fetches user events for the requested date range', async () => {
      const userId = 7;
      const startDate = '2026-09-10T00:00:00.000Z';
      const endDate = '2026-09-20T00:00:00.000Z';

      const events: EventProjection[] = [
        {
          id: 3,
          title: 'Event C',
          description: null,
          startDate: new Date('2026-09-11T10:00:00.000Z'),
          endDate: new Date('2026-09-11T11:00:00.000Z'),
          color: 'green',
        },
      ];

      prisma.event.findMany.mockResolvedValue(events);

      const result = await service.getUserEvents(userId, startDate, endDate);

      expect(prisma.event.findMany).toHaveBeenCalledTimes(1);

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          AND: [
            { startDate: { lte: new Date(endDate) } },
            { endDate: { gte: new Date(startDate) } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          color: true,
        },
        orderBy: { startDate: 'asc' },
      });

      expect(result).toEqual(events);
    });

    it('returns null when no events exist in requested time range', async () => {
      prisma.event.findMany.mockResolvedValue([]);

      const result = await service.getUserEvents(
        1,
        '2026-09-10T00:00:00.000Z',
        '2026-09-20T00:00:00.000Z',
      );

      expect(result).toBeNull();
      expect(prisma.event.findMany).toHaveBeenCalledTimes(1);
    });

    it('propagates prisma.findMany failure', async () => {
      prisma.event.findMany.mockRejectedValue(new Error('event query failed'));

      await expect(
        service.getUserEvents(
          1,
          '2026-09-10T00:00:00.000Z',
          '2026-09-20T00:00:00.000Z',
        ),
      ).rejects.toThrow('event query failed');
    });
  });

  describe('findOne()', () => {
    it('returns event owned by the user', async () => {
      const event: EventProjection = {
        id: 42,
        title: 'Planning',
        description: 'Planning session',
        startDate: new Date('2026-09-13T10:00:00.000Z'),
        endDate: new Date('2026-09-13T11:00:00.000Z'),
        color: 'purple',
      };

      prisma.event.findUnique.mockResolvedValue(event);

      const result = await service.findOne(42, 3);

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: {
          id: 42,
          userId: 3,
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          color: true,
        },
      });

      expect(result).toEqual(event);
    });

    it('throws ForbiddenException when event is not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne(42, 3)).rejects.toThrow(ForbiddenException);

      await expect(service.findOne(42, 3)).rejects.toThrow('Event not found');
    });

    it('propagates prisma.findUnique failure', async () => {
      prisma.event.findUnique.mockRejectedValue(
        new Error('prisma unavailable'),
      );

      await expect(service.findOne(42, 3)).rejects.toThrow(
        'prisma unavailable',
      );
    });
  });

  describe('update()', () => {
    it('updates event for the specified user and normalizes dates', async () => {
      const updateDto: UpdateEventDto = {
        title: 'Updated title',
        description: 'Updated description',
        startDate: '2026-09-13T10:15:30.000Z',
        endDate: '2026-09-13T11:15:30.000Z',
        color: 'red',
      };

      const updated: EventProjection = {
        id: 10,
        title: updateDto.title,
        description: updateDto.description ?? null,
        startDate: new Date(updateDto.startDate),
        endDate: new Date(updateDto.endDate),
        color: updateDto.color,
      };

      prisma.event.update.mockResolvedValue(updated);

      const result = await service.update(10, updateDto, 2);

      expect(prisma.event.update).toHaveBeenCalledTimes(1);

      const callArgs = prisma.event.update.mock.calls[0]?.[0];

      expect(callArgs).toBeDefined();

      if (!callArgs) {
        throw new Error('update must be called');
      }

      expect(callArgs.where).toEqual({
        id: 10,
        userId: 2,
      });

      expect(callArgs.select).toEqual({
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        color: true,
      });

      const startDate = callArgs.data.startDate as Date;
      const endDate = callArgs.data.endDate as Date;

      expect(startDate).toBeInstanceOf(Date);
      expect(endDate).toBeInstanceOf(Date);

      expect(startDate.getSeconds()).toBe(0);
      expect(endDate.getSeconds()).toBe(0);

      expect(startDate.getMilliseconds()).toBe(0);
      expect(endDate.getMilliseconds()).toBe(0);

      expect(result).toEqual(updated);
    });

    it('passes only provided fields when updating partially', async () => {
      const updateDto = {
        title: 'Updated only title',
      } as UpdateEventDto;

      const updated: EventProjection = {
        id: 10,
        title: 'Updated only title',
        description: null,
        startDate: new Date('2026-09-13T10:00:00.000Z'),
        endDate: new Date('2026-09-13T11:00:00.000Z'),
        color: 'blue',
      };

      prisma.event.update.mockResolvedValue(updated);

      await service.update(10, updateDto, 2);

      expect(prisma.event.update).toHaveBeenCalledWith({
        where: {
          id: 10,
          userId: 2,
        },
        data: {
          title: 'Updated only title',
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          color: true,
        },
      });
    });

    it('propagates prisma.update failure', async () => {
      prisma.event.update.mockRejectedValue(new Error('cannot update event'));

      await expect(
        service.update(
          10,
          {
            title: 'x',
            startDate: '2026-09-13T10:00:00.000Z',
            endDate: '2026-09-13T11:00:00.000Z',
            color: 'blue',
          } as UpdateEventDto,
          2,
        ),
      ).rejects.toThrow('cannot update event');
    });
  });

  describe('remove()', () => {
    it('deletes event for the specified user', async () => {
      const deleted: EventProjection = {
        id: 99,
        title: 'Delete me',
        description: null,
        startDate: new Date('2026-09-13T10:00:00.000Z'),
        endDate: new Date('2026-09-13T11:00:00.000Z'),
        color: 'orange',
      };

      prisma.event.delete.mockResolvedValue(deleted);

      await expect(service.remove(99, 4)).resolves.toBeUndefined();

      expect(prisma.event.delete).toHaveBeenCalledWith({
        where: {
          id: 99,
          userId: 4,
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          color: true,
        },
      });
    });

    it('propagates prisma.delete failure', async () => {
      prisma.event.delete.mockRejectedValue(new Error('cannot delete event'));

      await expect(service.remove(99, 4)).rejects.toThrow(
        'cannot delete event',
      );
    });
  });
});
