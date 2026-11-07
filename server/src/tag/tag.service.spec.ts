import { jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { MetadataCleanupService } from '../metadata-cleanup/metadata-cleanup.service';
import { TagService } from './tag.service';

describe('TagService', () => {
  let service: TagService;

  const tag = {
    id: 1,
    name: 'react',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prisma = {
    tag: {
      findMany: jest.fn<(...args: any[]) => Promise<unknown[]>>(),
      findUnique: jest.fn<(...args: any[]) => Promise<unknown>>(),
      create: jest.fn<(...args: any[]) => Promise<unknown>>(),
      update: jest.fn<(...args: any[]) => Promise<unknown>>(),
    },
    $transaction: jest.fn(),
  };
  const metadataCleanup = {
    cleanupUnusedTags: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.tag.findMany.mockResolvedValue([]);
    prisma.tag.findUnique.mockResolvedValue(tag);
    prisma.tag.create.mockResolvedValue(tag);
    prisma.tag.update.mockResolvedValue(tag);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    metadataCleanup.cleanupUnusedTags.mockResolvedValue({ count: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
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

    service = module.get<TagService>(TagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists all tags', async () => {
    await service.findAll();

    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  });

  it('finds a tag by id', async () => {
    const result = await service.findOne(1);

    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
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

    expect(result).toEqual(tag);
  });

  it('creates a tag', async () => {
    const result = await service.create({
      name: 'react',
    });

    expect(prisma.tag.create).toHaveBeenCalledWith({
      data: {
        name: 'react',
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    expect(result).toEqual(tag);
  });

  it('updates a tag', async () => {
    await service.update(1, {
      name: 'reactjs',
    });

    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
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

    expect(prisma.tag.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        name: 'reactjs',
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('deletes a tag', async () => {
    await service.remove(1);

    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { id: true },
    });
    expect(metadataCleanup.cleanupUnusedTags).toHaveBeenCalledWith(prisma, [1]);
  });

  it('does not delete a tag that is still in use', async () => {
    metadataCleanup.cleanupUnusedTags.mockResolvedValueOnce({ count: 0 });

    await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
  });
});
