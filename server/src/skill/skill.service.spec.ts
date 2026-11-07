import { jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { MetadataCleanupService } from '../metadata-cleanup/metadata-cleanup.service';
import { SkillService } from './skill.service';

describe('SkillService', () => {
  let service: SkillService;

  const skill = {
    id: 1,
    name: 'nestjs',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prisma = {
    skill: {
      findMany: jest.fn<(...args: any[]) => Promise<unknown[]>>(),
      findUnique: jest.fn<(...args: any[]) => Promise<unknown>>(),
      create: jest.fn<(...args: any[]) => Promise<unknown>>(),
      update: jest.fn<(...args: any[]) => Promise<unknown>>(),
    },
    $transaction: jest.fn(),
  };
  const metadataCleanup = {
    cleanupUnusedSkills: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.skill.findMany.mockResolvedValue([]);
    prisma.skill.findUnique.mockResolvedValue(skill);
    prisma.skill.create.mockResolvedValue(skill);
    prisma.skill.update.mockResolvedValue(skill);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    metadataCleanup.cleanupUnusedSkills.mockResolvedValue({ count: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: MetadataCleanupService,
          useValue: metadataCleanup,
        },
      ],
    }).compile();

    service = module.get<SkillService>(SkillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists all skills', async () => {
    await service.findAll();

    expect(prisma.skill.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  });

  it('finds a skill by id', async () => {
    const result = await service.findOne(1);

    expect(prisma.skill.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    expect(result).toEqual(skill);
  });

  it('creates a skill', async () => {
    const result = await service.create({
      name: 'nestjs',
    });

    expect(prisma.skill.create).toHaveBeenCalledWith({
      data: {
        name: 'nestjs',
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    expect(result).toEqual(skill);
  });

  it('updates a skill', async () => {
    await service.update(1, {
      name: 'nodejs',
    });

    expect(prisma.skill.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    expect(prisma.skill.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        name: 'nodejs',
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('deletes a skill', async () => {
    await service.remove(1);

    expect(prisma.skill.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { id: true },
    });
    expect(metadataCleanup.cleanupUnusedSkills).toHaveBeenCalledWith(
      prisma,
      [1],
    );
  });

  it('does not delete a skill that is still in use', async () => {
    metadataCleanup.cleanupUnusedSkills.mockResolvedValueOnce({ count: 0 });

    await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
  });
});
