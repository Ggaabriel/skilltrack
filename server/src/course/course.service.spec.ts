import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { MetadataCleanupService } from '../metadata-cleanup/metadata-cleanup.service';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let service: CourseService;
  const transaction = {
    course: {
      findUniqueOrThrow: jest.fn<(...args: any[]) => Promise<unknown>>(),
      delete: jest.fn<(...args: any[]) => Promise<unknown>>(),
    },
    node: {
      findMany: jest.fn<(...args: any[]) => Promise<any[]>>(),
    },
    nodeTag: {
      findMany: jest.fn<(...args: any[]) => Promise<{ tagId: number }[]>>(),
      deleteMany: jest.fn<(...args: any[]) => Promise<unknown>>(),
      createMany: jest.fn<(...args: any[]) => Promise<unknown>>(),
    },
    nodeSkill: {
      findMany: jest.fn<(...args: any[]) => Promise<{ skillId: number }[]>>(),
      deleteMany: jest.fn<(...args: any[]) => Promise<unknown>>(),
      createMany: jest.fn<(...args: any[]) => Promise<unknown>>(),
    },
    tag: {
      findMany: jest.fn<(...args: any[]) => Promise<{ id: number }[]>>(),
    },
    skill: {
      findMany: jest.fn<(...args: any[]) => Promise<{ id: number }[]>>(),
    },
  };

  const course = {
    id: 13,
    title: 'React',
    description: 'React course',
    type: 'STEP_BY_STEP',
    cover: null,
    isPublished: false,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 42,
      name: 'Course author',
      picturePath: null,
    },

    nodes: [],
  };

  const prisma = {
    course: {
      findMany: jest.fn<(...args: any[]) => Promise<unknown[]>>(),
      findFirst: jest.fn<(...args: any[]) => Promise<unknown>>(),
      findUniqueOrThrow: jest.fn<(...args: any[]) => Promise<unknown>>(),
      create: jest.fn<(...args: any[]) => Promise<unknown>>(),
      update: jest.fn<(...args: any[]) => Promise<unknown>>(),
      delete: jest.fn<(...args: any[]) => Promise<unknown>>(),
    },

    $transaction: jest.fn(
      async (
        callback: (tx: typeof transaction) => Promise<unknown>,
      ): Promise<unknown> => callback(transaction),
    ),
  };
  const metadataCleanup = {
    cleanupUnusedTags: jest.fn(),
    cleanupUnusedSkills: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.course.findFirst.mockResolvedValue(course);
    prisma.course.findMany.mockResolvedValue([]);
    prisma.course.findUniqueOrThrow.mockResolvedValue(course);
    prisma.course.create.mockResolvedValue(course);
    prisma.course.update.mockResolvedValue(course);
    prisma.course.delete.mockResolvedValue(course);
    transaction.course.findUniqueOrThrow.mockResolvedValue(course);
    transaction.course.delete.mockResolvedValue(course);
    transaction.node.findMany.mockResolvedValue([]);
    transaction.nodeTag.findMany.mockResolvedValue([]);
    transaction.nodeSkill.findMany.mockResolvedValue([]);
    transaction.tag.findMany.mockResolvedValue([]);
    transaction.skill.findMany.mockResolvedValue([]);
    metadataCleanup.cleanupUnusedTags.mockResolvedValue({ count: 0 });
    metadataCleanup.cleanupUnusedSkills.mockResolvedValue({ count: 0 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
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

    service = module.get<CourseService>(CourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filters the course list by its owner and selects node tags and skills', async () => {
    await service.findAll(42);

    expect(prisma.course.findMany).toHaveBeenCalledWith({
      where: {
        userId: 42,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        cover: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            picturePath: true,
          },
        },

        nodes: {
          select: {
            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },

            skills: {
              select: {
                skill: {
                  select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('finds a course only when it belongs to the current user', async () => {
    const result = await service.findOne(13, 42);

    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: {
        id: 13,
        userId: 42,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        cover: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            picturePath: true,
          },
        },

        nodes: {
          select: {
            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },

            skills: {
              select: {
                skill: {
                  select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(result).toMatchObject({
      id: course.id,
      author: course.user,
      tags: [],
      skills: [],
    });
    expect(result).not.toHaveProperty('nodes');
  });

  it('scopes update operation by owner', async () => {
    await service.update(13, 42, {
      title: 'Updated title',
    });

    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: {
        id: 13,
        userId: 42,
      },
      select: expect.any(Object) as object,
    });

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: {
        id: 13,
      },
      data: {
        title: 'Updated title',
      },
      select: expect.any(Object) as object,
    });
  });

  it('publishes a course and records its publication time', async () => {
    const publishedAt = new Date();
    prisma.course.update.mockResolvedValue({
      ...course,
      isPublished: true,
      publishedAt,
    });

    const publishedCourse = await service.publish(13, 42);

    expect(prisma.course.update).toHaveBeenCalledTimes(1);
    expect(publishedCourse).toMatchObject({ isPublished: true, publishedAt });
  });

  it('allows the owner to edit published course details', async () => {
    prisma.course.findFirst.mockResolvedValue({
      ...course,
      isPublished: true,
    });
    prisma.course.update.mockResolvedValue({
      ...course,
      title: 'Updated title',
      isPublished: true,
    });

    const updatedCourse = await service.update(13, 42, {
      title: 'Updated title',
    });

    expect(updatedCourse).toMatchObject({
      title: 'Updated title',
      isPublished: true,
    });
    expect(prisma.course.update).toHaveBeenCalled();
  });

  it('applies course tags to every node and cleans only detached metadata', async () => {
    transaction.tag.findMany.mockResolvedValue([{ id: 3 }]);
    transaction.node.findMany.mockResolvedValue([
      { id: 11, tags: [{ tagId: 2 }] },
      { id: 12, tags: [{ tagId: 2 }] },
    ]);

    await service.updateTags(13, 42, [3, 3]);

    expect(transaction.nodeTag.deleteMany).toHaveBeenCalledWith({
      where: { nodeId: { in: [11, 12] } },
    });
    expect(transaction.nodeTag.createMany).toHaveBeenCalledWith({
      data: [
        { nodeId: 11, tagId: 3 },
        { nodeId: 12, tagId: 3 },
      ],
    });
    expect(metadataCleanup.cleanupUnusedTags).toHaveBeenCalledWith(
      transaction,
      [2],
    );
  });

  it('applies course skills to every node and cleans only detached metadata', async () => {
    transaction.skill.findMany.mockResolvedValue([{ id: 5 }]);
    transaction.node.findMany.mockResolvedValue([
      { id: 11, skills: [{ skillId: 4 }] },
      { id: 12, skills: [{ skillId: 4 }] },
    ]);

    await service.updateSkills(13, 42, [5]);

    expect(transaction.nodeSkill.deleteMany).toHaveBeenCalledWith({
      where: { nodeId: { in: [11, 12] } },
    });
    expect(transaction.nodeSkill.createMany).toHaveBeenCalledWith({
      data: [
        { nodeId: 11, skillId: 5 },
        { nodeId: 12, skillId: 5 },
      ],
    });
    expect(metadataCleanup.cleanupUnusedSkills).toHaveBeenCalledWith(
      transaction,
      [4],
    );
  });

  it('scopes delete operation by owner', async () => {
    transaction.nodeTag.findMany.mockResolvedValue([{ tagId: 6 }]);
    transaction.nodeSkill.findMany.mockResolvedValue([{ skillId: 8 }]);

    await service.remove(13, 42);

    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: {
        id: 13,
        userId: 42,
      },
      select: expect.any(Object) as object,
    });

    expect(transaction.course.delete).toHaveBeenCalledWith({
      where: {
        id: 13,
      },
    });
    expect(transaction.nodeTag.findMany).toHaveBeenCalledWith({
      where: { node: { is: { courseId: 13 } } },
      select: { tagId: true },
    });
    expect(transaction.nodeSkill.findMany).toHaveBeenCalledWith({
      where: { node: { is: { courseId: 13 } } },
      select: { skillId: true },
    });
    expect(metadataCleanup.cleanupUnusedTags).toHaveBeenCalledWith(
      transaction,
      [6],
    );
    expect(metadataCleanup.cleanupUnusedSkills).toHaveBeenCalledWith(
      transaction,
      [8],
    );
  });
});
