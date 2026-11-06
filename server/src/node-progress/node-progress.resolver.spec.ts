import { jest } from '@jest/globals';
import { NodeProgressResolver } from './node-progress.resolver';
import { NodeProgressService } from './node-progress.service';

describe('NodeProgressResolver', () => {
  const service = {
    findForCourse:
      jest.fn<(courseId: number, userId: number) => Promise<unknown[]>>(),
    findCourseProgressSummaries:
      jest.fn<(userId: number) => Promise<unknown[]>>(),
    setForNode: jest.fn<(userId: number, input: unknown) => Promise<unknown>>(),
    resetForNode:
      jest.fn<(userId: number, nodeId: number) => Promise<boolean>>(),
    resetForCourse:
      jest.fn<(userId: number, courseId: number) => Promise<boolean>>(),
    removeForCourse:
      jest.fn<(userId: number, courseId: number) => Promise<boolean>>(),
  };
  let resolver: NodeProgressResolver;

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new NodeProgressResolver(
      service as unknown as NodeProgressService,
    );
  });

  it('passes the authenticated user to progress queries', async () => {
    const progress = [{ nodeId: 17, percentage: 40 }];
    service.findForCourse.mockResolvedValue(progress);

    await expect(
      resolver.nodeProgress(9, { userId: 42, email: 'owner@example.com' }),
    ).resolves.toEqual({
      ok: true,
      status: 200,
      message: 'success',
      data: progress,
    });
    expect(service.findForCourse).toHaveBeenCalledWith(9, 42);
  });

  it('passes the authenticated user to progress updates', async () => {
    const input = { nodeId: 17, percentage: 75 };
    const progress = { nodeId: 17, percentage: 75 };
    service.setForNode.mockResolvedValue(progress);

    await expect(
      resolver.setNodeProgress(input as never, {
        userId: 42,
        email: 'owner@example.com',
      }),
    ).resolves.toMatchObject({ data: progress });
    expect(service.setForNode).toHaveBeenCalledWith(42, input);
  });

  it('resets the authenticated user progress for a course', async () => {
    service.resetForCourse.mockResolvedValue(true);

    await expect(
      resolver.resetCourseProgress(9, {
        userId: 42,
        email: 'owner@example.com',
      }),
    ).resolves.toMatchObject({ data: true });
    expect(service.resetForCourse).toHaveBeenCalledWith(42, 9);
  });

  it('removes only the authenticated user progress for a course', async () => {
    service.removeForCourse.mockResolvedValue(true);

    await expect(
      resolver.removeCourseProgress(9, {
        userId: 42,
        email: 'owner@example.com',
      }),
    ).resolves.toMatchObject({ data: true });
    expect(service.removeForCourse).toHaveBeenCalledWith(42, 9);
  });
});
