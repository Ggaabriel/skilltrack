import { jest } from '@jest/globals';
import { CourseResolver } from './course.resolver';
import { CourseService } from './course.service';

describe('CourseResolver', () => {
  let resolver: CourseResolver;
  const courseService = {
    findAll:
      jest.fn<(userId: number) => Promise<{ id: number; title: string }[]>>(),
    findOne: jest.fn<(id: number, userId: number) => Promise<unknown>>(),
    create: jest.fn<(userId: number, data: unknown) => Promise<unknown>>(),
    update:
      jest.fn<
        (id: number, userId: number, data: unknown) => Promise<unknown>
      >(),
    remove: jest.fn<(id: number, userId: number) => Promise<boolean>>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new CourseResolver(courseService as unknown as CourseService);
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
});
