import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let service: CourseService;
  const prisma = {
    course: {
      findMany: jest.fn<(...args: any[]) => Promise<unknown[]>>(),
      findFirst: jest.fn<(...args: any[]) => Promise<unknown>>(),
      create: jest.fn<(...args: any[]) => Promise<unknown>>(),
      update: jest.fn<(...args: any[]) => Promise<unknown>>(),
      delete: jest.fn<(...args: any[]) => Promise<unknown>>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filters the course list by its owner and selects only public fields', async () => {
    await service.findAll(42);

    expect(prisma.course.findMany).toHaveBeenCalledWith({
      where: { userId: 42 },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        cover: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('finds a course only when it belongs to the current user', async () => {
    await service.findOne(13, 42);

    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: { id: 13, userId: 42 },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        cover: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('scopes update and delete operations by owner', async () => {
    await service.update(13, 42, { title: 'Updated title' });
    await service.remove(13, 42);

    expect(prisma.course.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 13, userId: 42 } }),
    );
    expect(prisma.course.delete).toHaveBeenCalledWith({
      where: { id: 13, userId: 42 },
    });
  });
});
