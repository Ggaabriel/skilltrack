import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TagService } from './tag.service';

describe('TagService', () => {
  let service: TagService;
  const prisma = {
    course: {
      findFirst: jest.fn<() => Promise<unknown>>(),
    },
    tag: {
      findMany: jest.fn<() => Promise<unknown[]>>(),
      findFirst: jest.fn<() => Promise<unknown>>(),
      create: jest.fn<() => Promise<unknown>>(),
      update: jest.fn<() => Promise<unknown>>(),
      delete: jest.fn<() => Promise<unknown>>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TagService>(TagService);
  });

  it('lists tags only from owned courses', async () => {
    prisma.tag.findMany.mockResolvedValue([]);

    await service.findAll(7, 42);

    expect(prisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { courseId: 7, course: { is: { userId: 42 } } },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('creates a tag in an owned course only', async () => {
    prisma.course.findFirst.mockResolvedValue({ id: 7 });
    prisma.tag.create.mockResolvedValue({ id: 1, name: 'react', courseId: 7 });

    await service.create(42, { courseId: 7, name: 'react' });

    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: { id: 7, userId: 42 },
      select: { id: true },
    });
    expect(prisma.tag.create).toHaveBeenCalledWith({
      data: {
        courseId: 7,
        name: 'react',
      },
      select: {
        id: true,
        name: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it("rejects creating a tag in another user's course", async () => {
    prisma.course.findFirst.mockResolvedValue(null);

    await expect(
      service.create(42, { courseId: 7, name: 'react' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.tag.create).not.toHaveBeenCalled();
  });
});
