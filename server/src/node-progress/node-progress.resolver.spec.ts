import { jest } from '@jest/globals';
import { NodeProgressResolver } from './node-progress.resolver';
import { NodeProgressService } from './node-progress.service';

describe('NodeProgressResolver', () => {
  const service = {
    findForCourse:
      jest.fn<(courseId: number, userId: number) => Promise<unknown[]>>(),
    setForNode: jest.fn<(userId: number, input: unknown) => Promise<unknown>>(),
    resetForNode:
      jest.fn<(userId: number, nodeId: number) => Promise<boolean>>(),
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
});
