import { jest } from '@jest/globals';
import { Prisma } from '../generated/prisma/client';
import { MetadataCleanupService } from './metadata-cleanup.service';

describe('MetadataCleanupService', () => {
  const tx = {
    tag: {
      deleteMany: jest.fn<(...args: any[]) => Promise<{ count: number }>>(),
    },
    skill: {
      deleteMany: jest.fn<(...args: any[]) => Promise<{ count: number }>>(),
    },
  };
  let service: MetadataCleanupService;

  beforeEach(() => {
    jest.clearAllMocks();
    tx.tag.deleteMany.mockResolvedValue({ count: 0 });
    tx.skill.deleteMany.mockResolvedValue({ count: 0 });
    service = new MetadataCleanupService();
  });

  it('deletes only requested tags that have no node relations', async () => {
    await service.cleanupUnusedTags(
      tx as unknown as Prisma.TransactionClient,
      [3, 5],
    );

    expect(tx.tag.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: [3, 5] },
        nodes: { none: {} },
      },
    });
  });

  it('deletes only requested skills that have no node relations', async () => {
    await service.cleanupUnusedSkills(
      tx as unknown as Prisma.TransactionClient,
      [4, 6],
    );

    expect(tx.skill.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: [4, 6] },
        nodes: { none: {} },
      },
    });
  });
});
