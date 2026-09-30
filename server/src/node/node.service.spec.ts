import { jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NodeService } from './node.service';

type NodeFixture = {
  id: number;
  title: string;
  content: string;
  position: number;
  courseId: number;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

const nodeFixture = (overrides: Partial<NodeFixture> = {}): NodeFixture => ({
  id: 1,
  title: 'Node',
  content: 'Node content',
  position: 0,
  courseId: 7,
  parentId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('NodeService', () => {
  let service: NodeService;
  const transaction = {
    node: {
      findMany: jest.fn<() => Promise<{ id: number }[]>>(),
      update: jest.fn<() => Promise<unknown>>(),
    },
  };
  const prisma = {
    course: {
      findFirst: jest.fn<() => Promise<unknown>>(),
    },
    node: {
      findMany: jest.fn<() => Promise<unknown[]>>(),
      findFirst: jest.fn<() => Promise<unknown>>(),
      create: jest.fn<() => Promise<unknown>>(),
      update: jest.fn<() => Promise<unknown>>(),
      delete: jest.fn<() => Promise<unknown>>(),
    },
    $transaction: jest.fn(
      async (
        callback: (tx: typeof transaction) => Promise<unknown>,
      ): Promise<unknown> => callback(transaction),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [NodeService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<NodeService>(NodeService);
  });

  it('lists nodes only from courses owned by the current user', async () => {
    prisma.node.findMany.mockResolvedValue([]);

    await service.findAll(7, 42);

    expect(prisma.node.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { courseId: 7, course: { is: { userId: 42 } } },
        orderBy: [{ position: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('builds a nested tree ordered by position and id', async () => {
    const records = [
      nodeFixture({ id: 1, title: 'Root' }),
      nodeFixture({ id: 2, title: 'Child', parentId: 1, position: 1 }),
      nodeFixture({ id: 3, title: 'Grandchild', parentId: 2, position: 0 }),
      nodeFixture({ id: 4, title: 'Second root', position: 2 }),
    ];
    prisma.node.findMany.mockResolvedValue(records);

    const tree = await service.findAll(7, 42);

    expect(tree).toHaveLength(2);
    expect(tree[0]).toMatchObject({
      id: 1,
      children: [
        {
          id: 2,
          children: [{ id: 3, children: [] }],
        },
      ],
    });
    expect(tree[1]).toMatchObject({ id: 4, children: [] });
  });

  it('creates a node only in an owned course and validates its parent', async () => {
    prisma.course.findFirst.mockResolvedValue({ id: 7 });
    prisma.node.findFirst
      .mockResolvedValueOnce({ id: 3 })
      .mockResolvedValueOnce({ courseId: 7 });
    prisma.node.create.mockResolvedValue({ id: 14 });
    prisma.node.findMany.mockResolvedValue([
      nodeFixture({ id: 3, title: 'Parent' }),
      nodeFixture({ id: 14, title: 'Lesson', parentId: 3, position: 1 }),
    ]);

    const result = await service.create(42, {
      courseId: 7,
      title: 'Lesson',
      content: 'Lesson content',
      position: 1,
      parentId: 3,
    });

    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: { id: 7, userId: 42 },
      select: { id: true },
    });
    expect(prisma.node.findFirst).toHaveBeenCalledWith({
      where: { id: 3, courseId: 7 },
      select: { id: true },
    });
    expect(prisma.node.create).toHaveBeenCalledWith({
      data: {
        title: 'Lesson',
        content: 'Lesson content',
        position: 1,
        courseId: 7,
        parentId: 3,
      },
      select: { id: true },
    });
    expect(result).toMatchObject({
      id: 14,
      parentId: 3,
      children: [],
    });
  });

  it('rejects creating a node in a course owned by someone else', async () => {
    prisma.course.findFirst.mockResolvedValue(null);

    await expect(
      service.create(42, {
        courseId: 7,
        title: 'Lesson',
        content: 'Lesson content',
        position: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.node.create).not.toHaveBeenCalled();
  });

  it('rejects assigning a parent from another course', async () => {
    prisma.course.findFirst.mockResolvedValue({ id: 7 });
    prisma.node.findFirst.mockResolvedValue(null);

    await expect(
      service.create(42, {
        courseId: 7,
        title: 'Lesson',
        content: 'Lesson content',
        position: 1,
        parentId: 99,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.node.create).not.toHaveBeenCalled();
  });

  it('scopes node lookup, update and delete to the course owner', async () => {
    prisma.node.findFirst.mockResolvedValue({ id: 13, courseId: 7 });
    prisma.node.update.mockResolvedValue({ id: 13 });
    prisma.node.findMany.mockResolvedValue([nodeFixture({ id: 13 })]);

    await service.findOne(13, 42);
    await service.update(13, 42, { title: 'Updated' });
    await service.remove(13, 42);

    expect(prisma.node.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 13, course: { is: { userId: 42 } } },
      }),
    );
    expect(prisma.node.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 13, course: { is: { userId: 42 } } },
      }),
    );
    expect(prisma.node.delete).toHaveBeenCalledWith({
      where: { id: 13, course: { is: { userId: 42 } } },
    });
  });

  it('rejects updates that would create a parent cycle', async () => {
    prisma.node.findFirst.mockResolvedValue({ id: 1, courseId: 7 });
    prisma.node.findMany.mockResolvedValue([
      nodeFixture({ id: 1 }),
      nodeFixture({ id: 2, parentId: 1 }),
    ]);

    await expect(service.update(1, 42, { parentId: 2 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.node.update).not.toHaveBeenCalled();
  });

  it('moves a node to another parent and reorders both sibling groups transactionally', async () => {
    prisma.node.findFirst
      .mockResolvedValueOnce({ id: 5, courseId: 7, parentId: null })
      .mockResolvedValueOnce({ id: 3 })
      .mockResolvedValueOnce({ courseId: 7 });
    prisma.node.findMany
      .mockResolvedValueOnce([
        { id: 5, parentId: null },
        { id: 3, parentId: null },
      ])
      .mockResolvedValueOnce([{ id: 4 }])
      .mockResolvedValueOnce([
        nodeFixture({ id: 3, title: 'New parent' }),
        nodeFixture({ id: 4, title: 'Existing child', parentId: 3 }),
        nodeFixture({ id: 5, title: 'Moved node', parentId: 3, position: 1 }),
      ]);
    prisma.node.update.mockResolvedValue({ id: 5 });
    transaction.node.findMany.mockResolvedValue([]);
    transaction.node.update.mockResolvedValue({ id: 0 });

    await service.move(5, 42, { parentId: 3, position: 1 });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transaction.node.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { position: 0 },
    });
    expect(transaction.node.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { parentId: 3, position: 1 },
    });
  });

  it('keeps the current parent when only changing sibling position', async () => {
    prisma.node.findFirst
      .mockResolvedValueOnce({ id: 5, courseId: 7, parentId: 3 })
      .mockResolvedValueOnce({ courseId: 7 });
    prisma.node.findMany
      .mockResolvedValueOnce([{ id: 4 }])
      .mockResolvedValueOnce([
        nodeFixture({ id: 4, parentId: 3, position: 0 }),
        nodeFixture({ id: 5, parentId: 3, position: 1 }),
      ]);
    prisma.node.update.mockResolvedValue({ id: 5 });
    transaction.node.update.mockResolvedValue({ id: 0 });

    await service.move(5, 42, { position: 1 });

    expect(transaction.node.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { parentId: 3, position: 1 },
    });
  });
});
