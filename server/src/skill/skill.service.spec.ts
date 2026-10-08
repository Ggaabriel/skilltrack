import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
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
      delete: jest.fn<(...args: any[]) => Promise<unknown>>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.skill.findMany.mockResolvedValue([]);
    prisma.skill.findUnique.mockResolvedValue(skill);
    prisma.skill.create.mockResolvedValue(skill);
    prisma.skill.update.mockResolvedValue(skill);
    prisma.skill.delete.mockResolvedValue(skill);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillService,
        {
          provide: PrismaService,
          useValue: prisma,
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

    expect(prisma.skill.delete).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    });
  });
});
