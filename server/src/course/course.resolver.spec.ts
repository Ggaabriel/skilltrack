import { jest } from '@jest/globals';
import { CourseResolver } from './course.resolver';
import { CourseService } from './course.service';

describe('CourseResolver', () => {
  let resolver: CourseResolver;
  const courseService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new CourseResolver(courseService as unknown as CourseService);
  });

  it('wraps the course list in the standard success response', async () => {
    const courses = [{ id: 13, title: 'GraphQL с нуля' }];
    courseService.findAll.mockResolvedValue(courses);

    await expect(resolver.courses()).resolves.toEqual({
      ok: true,
      status: 200,
      message: 'success',
      data: courses,
    });
  });

  it('is defined', () => {
    expect(resolver).toBeDefined();
  });
});
