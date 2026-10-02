import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SkillService } from './skill.service';

describe('SkillService', () => {
  let service: SkillService;
  const prisma = {
    course: {
      findFirst: jest.fn<() => Promise<unknown>>(),
    },
    skill: {
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
      providers: [SkillService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<SkillService>(SkillService);
  });

  it('lists skills only from courses owned by the current user', async () => {
    prisma.skill.findMany.mockResolvedValue([]);

    await service.findAll(7, 42);

    expect(prisma.skill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { courseId: 7, course: { is: { userId: 42 } } },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('creates a skill only in an owned course', async () => {
    prisma.course.findFirst.mockResolvedValue({ id: 7 });
    prisma.skill.create.mockResolvedValue({
      id: 1,
      name: 'nestjs',
      courseId: 7,
    });

    await service.create(42, { courseId: 7, name: 'nestjs' });

    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: { id: 7, userId: 42 },
      select: { id: true },
    });
    expect(prisma.skill.create).toHaveBeenCalledWith({
      data: { courseId: 7, name: 'nestjs' },
      select: {
        id: true,
        name: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it("rejects creating a skill in another user's course", async () => {
    prisma.course.findFirst.mockResolvedValue(null);

    await expect(
      service.create(42, { courseId: 7, name: 'nestjs' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.skill.create).not.toHaveBeenCalled();
  });
});
