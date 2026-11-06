import { jest } from '@jest/globals';
import { CourseResolver } from './course.resolver';
import { CourseService } from './course.service';
import { NodeService } from '../node/node.service';

describe('CourseResolver', () => {
  let resolver: CourseResolver;
  const courseService = {
    findAll:
      jest.fn<(userId: number) => Promise<{ id: number; title: string }[]>>(),
    findPublishedAll: jest.fn<() => Promise<unknown[]>>(),
    findPublishedOne: jest.fn<(id: number) => Promise<unknown>>(),
    publish: jest.fn<(id: number, userId: number) => Promise<unknown>>(),
    findOne: jest.fn<(id: number, userId: number) => Promise<unknown>>(),
    create: jest.fn<(userId: number, data: unknown) => Promise<unknown>>(),
    update:
      jest.fn<
        (id: number, userId: number, data: unknown) => Promise<unknown>
      >(),
    remove: jest.fn<(id: number, userId: number) => Promise<boolean>>(),
  };
  const nodeService = {
    findPublishedRecords: jest.fn<(courseId: number) => Promise<unknown[]>>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new CourseResolver(
      courseService as unknown as CourseService,
      nodeService as unknown as NodeService,
    );
  });

  it('wraps the course list in the standard success response', async () => {
    const courses = [{ id: 13, title: 'GraphQL с нуля' }];
    courseService.findAll.mockResolvedValue(courses);

    await expect(
      resolver.courses({ userId: 42, email: 'owner@example.com' }),
    ).resolves.toEqual({
      ok: true,
      status: 200,
      message: 'success',
      data: courses,
    });
    expect(courseService.findAll).toHaveBeenCalledWith(42);
  });

  it('uses the authenticated user for course creation', async () => {
    const createdCourse = { id: 13, title: 'GraphQL course' };
    const input = { title: 'GraphQL course', type: 'STEP_BY_STEP' };
    courseService.create.mockResolvedValue(createdCourse);

    await expect(
      resolver.createCourse(input as never, {
        userId: 42,
        email: 'owner@example.com',
      }),
    ).resolves.toMatchObject({ data: createdCourse });
    expect(courseService.create).toHaveBeenCalledWith(42, input);
  });

  it('is defined', () => {
    expect(resolver).toBeDefined();
  });

  it('resolves all published course nodes as a flat list', async () => {
    const nodes = [
      { id: 1, parentId: null },
      { id: 2, parentId: 1 },
      { id: 3, parentId: null },
    ];
    nodeService.findPublishedRecords.mockResolvedValue(nodes);

    await expect(resolver.nodes({ id: 7 } as never)).resolves.toEqual(nodes);
    expect(nodeService.findPublishedRecords).toHaveBeenCalledWith(7);
  });
});
