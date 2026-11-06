import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NodeProgressService } from './node-progress.service';

type ProgressUpsertArgs = {
  where: { userId_nodeId: { userId: number; nodeId: number } };
  create: {
    userId: number;
    nodeId: number;
    percentage: number;
    completedAt: Date | null;
  };
  update: { percentage: number; completedAt: Date | null };
  select: Record<string, true>;
};

describe('NodeProgressService', () => {
  let service: NodeProgressService;
  const prisma = {
    course: {
      findMany: jest.fn<() => Promise<unknown[]>>(),
    },
    node: {
      findFirst: jest.fn<() => Promise<unknown>>(),
    },
    $transaction: jest.fn(
      async (callback: (transaction: any) => Promise<unknown>) =>
        callback({
          nodeProgress: {
            deleteMany: jest.fn(async () => ({ count: 0 })),
            create: jest.fn(async () => ({})),
          },
        }),
    ),
    nodeProgress: {
      findMany: jest.fn<() => Promise<unknown[]>>(),
      upsert: jest.fn<(args: ProgressUpsertArgs) => Promise<unknown>>(),
      deleteMany: jest.fn<() => Promise<{ count: number }>>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodeProgressService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NodeProgressService>(NodeProgressService);
  });

  it('lists progress for an owned or published course', async () => {
    prisma.nodeProgress.findMany.mockResolvedValue([]);

    await service.findForCourse(9, 42);

    expect(prisma.nodeProgress.findMany).toHaveBeenCalledWith({
      where: {
        userId: 42,
        node: {
          is: {
            courseId: 9,
            course: {
              is: {
                OR: [{ userId: 42 }, { isPublished: true }],
              },
            },
          },
        },
      },
      select: {
        id: true,
        nodeId: true,
        percentage: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  });

  it('summarizes completion for published courses of all types', async () => {
    prisma.course.findMany.mockResolvedValue([
      {
        id: 8,
        title: 'Course',
        type: 'FREE_FORM',
        user: { id: 13, name: 'Author', picturePath: null },
        nodes: [{ progress: [{ id: 1 }] }, { progress: [] }],
      },
    ]);

    await expect(service.findCourseProgressSummaries(42)).resolves.toEqual([
      {
        id: 8,
        title: 'Course',
        type: 'FREE_FORM',
        author: { id: 13, name: 'Author', picturePath: null },
        totalNodes: 2,
        completedNodes: 1,
        percentage: 50,
      },
    ]);
    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isPublished: true,
          nodes: {
            some: {
              progress: {
                some: { userId: 42 },
              },
            },
          },
        },
      }),
    );
  });

  it('restarts progress at zero for the first node in the course', async () => {
    prisma.node.findFirst.mockResolvedValue({ id: 11 });

    await expect(service.resetForCourse(42, 9)).resolves.toBe(true);

    expect(prisma.node.findFirst).toHaveBeenCalledWith({
      where: {
        courseId: 9,
        course: {
          is: { OR: [{ userId: 42 }, { isPublished: true }] },
        },
      },
      select: { id: true },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('removes progress only for the requested course and current user', async () => {
    prisma.nodeProgress.deleteMany.mockResolvedValue({ count: 2 });

    await expect(service.removeForCourse(42, 9)).resolves.toBe(true);
    expect(prisma.nodeProgress.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 42,
        node: {
          is: {
            courseId: 9,
            course: {
              is: {
                OR: [{ userId: 42 }, { isPublished: true }],
              },
            },
          },
        },
      },
    });
  });

  it('upserts progress for an owned node and timestamps completion', async () => {
    prisma.node.findFirst.mockResolvedValue({ id: 17 });
    prisma.nodeProgress.upsert.mockResolvedValue({
      id: 1,
      nodeId: 17,
      percentage: 100,
      completedAt: new Date(),
    });

    await service.setForNode(42, { nodeId: 17, percentage: 100 });

    expect(prisma.node.findFirst).toHaveBeenCalledWith({
      where: {
        id: 17,
        course: {
          is: { OR: [{ userId: 42 }, { isPublished: true }] },
        },
      },
      select: { id: true },
    });
    const upsertCall = prisma.nodeProgress.upsert.mock.calls[0]?.[0];
    expect(upsertCall).toBeDefined();
    if (!upsertCall) {
      throw new Error('Progress upsert must be called');
    }

    expect(upsertCall.where).toEqual({
      userId_nodeId: { userId: 42, nodeId: 17 },
    });
    expect(upsertCall.create).toMatchObject({
      userId: 42,
      nodeId: 17,
      percentage: 100,
    });
    expect(upsertCall.create.completedAt).toBeInstanceOf(Date);
    expect(upsertCall.update.percentage).toBe(100);
    expect(upsertCall.update.completedAt).toBeInstanceOf(Date);
  });

  it("does not allow setting progress on another user's node", async () => {
    prisma.node.findFirst.mockResolvedValue(null);

    await expect(
      service.setForNode(42, { nodeId: 17, percentage: 50 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.nodeProgress.upsert).not.toHaveBeenCalled();
  });

  it('resets progress scoped to the authenticated user and course owner', async () => {
    prisma.nodeProgress.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.resetForNode(42, 17)).resolves.toBe(true);
    expect(prisma.nodeProgress.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 42,
        nodeId: 17,
        node: {
          course: {
            is: { OR: [{ userId: 42 }, { isPublished: true }] },
          },
        },
      },
    });
  });
});
