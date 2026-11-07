import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MetadataCleanupService } from '../../metadata-cleanup/metadata-cleanup.service';
import { jest } from '@jest/globals';

describe('UserService', () => {
  let service: UserService;

  const prisma = {
    user: {
      findUnique: jest
        .fn<() => Promise<{ id: number; email: string } | null>>()
        .mockResolvedValue({ id: 1, email: 'test@example.com' }),
      delete: jest
        .fn<() => Promise<{ id: number; email: string }>>()
        .mockResolvedValue({ id: 1, email: 'test@example.com' }),
    },
    nodeTag: {
      findMany: jest.fn<() => Promise<{ tagId: number }[]>>(),
    },
    nodeSkill: {
      findMany: jest.fn<() => Promise<{ skillId: number }[]>>(),
    },
    $transaction: jest.fn(),
  };
  const metadataCleanup = {
    cleanupUnusedTags: jest.fn(),
    cleanupUnusedSkills: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: MetadataCleanupService, useValue: metadataCleanup },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
    });
    prisma.user.delete.mockResolvedValue({ id: 1, email: 'test@example.com' });
    prisma.nodeTag.findMany.mockResolvedValue([]);
    prisma.nodeSkill.findMany.mockResolvedValue([]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    metadataCleanup.cleanupUnusedTags.mockResolvedValue({ count: 0 });
    metadataCleanup.cleanupUnusedSkills.mockResolvedValue({ count: 0 });
  });

  describe('defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('find by email', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const user = await service.findByEmail(email);
      expect(user).toBeDefined();
    });

    it('should throw an error if user is not found', async () => {
      const email = 'nonexistent@example.com';

      prisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.findByEmail(email)).rejects.toThrow(
        'User not found',
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  it('cleans up metadata orphaned by deleting a user and their courses', async () => {
    prisma.nodeTag.findMany.mockResolvedValueOnce([{ tagId: 7 }]);
    prisma.nodeSkill.findMany.mockResolvedValueOnce([{ skillId: 9 }]);

    await expect(service.remove(1)).resolves.toMatchObject({ id: 1 });

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { id: true, email: true, name: true, picturePath: true },
    });
    expect(metadataCleanup.cleanupUnusedTags).toHaveBeenCalledWith(prisma, [7]);
    expect(metadataCleanup.cleanupUnusedSkills).toHaveBeenCalledWith(
      prisma,
      [9],
    );
  });
});
