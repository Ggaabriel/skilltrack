import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from 'src/event/event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { jest } from '@jest/globals';

describe('EventService Integration Tests', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let eventService: EventService;

  let user1: { id: number };
  let user2: { id: number };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, EventService],
    }).compile();

    prisma = module.get(PrismaService);
    eventService = module.get(EventService);

    await prisma.$connect();

    user1 = await prisma.user.create({
      data: {
        email: 'john.doe@example.com',
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
        email: 'john2.doe@example.com',
        name: 'John Doe',
        password: 'password123',
        picturePath: null,
      },
      select: {
        id: true,
      },
    });
  });

  beforeEach(async () => {
    await prisma.event.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();

    await prisma.$disconnect();

    await module.close();
  });
});
