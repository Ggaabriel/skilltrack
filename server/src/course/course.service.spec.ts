import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let service: CourseService;

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

    tags: [],
    skills: [],
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

    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.course.findFirst.mockResolvedValue(course);
    prisma.course.findMany.mockResolvedValue([]);
    prisma.course.findUniqueOrThrow.mockResolvedValue(course);
    prisma.course.create.mockResolvedValue(course);
    prisma.course.update.mockResolvedValue(course);
    prisma.course.delete.mockResolvedValue(course);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filters the course list by its owner and selects course fields with tags and skills', async () => {
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
    });

    const { user, ...courseData } = course;
    expect(result).toEqual({ ...courseData, author: user });
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

  it('scopes delete operation by owner', async () => {
    await service.remove(13, 42);

    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: {
        id: 13,
        userId: 42,
      },
      select: expect.any(Object) as object,
    });

    expect(prisma.course.delete).toHaveBeenCalledWith({
      where: {
        id: 13,
      },
    });
  });
});
