import { jest } from '@jest/globals';
import { NodeResolver } from './node.resolver';
import { NodeService } from './node.service';

describe('NodeResolver', () => {
  const nodeService = {
    findAll: jest.fn<() => Promise<unknown[]>>(),
    findOne: jest.fn<() => Promise<unknown>>(),
    create: jest.fn<() => Promise<unknown>>(),
    update: jest.fn<() => Promise<unknown>>(),
    move: jest.fn<
      (id: number, userId: number, input: unknown) => Promise<unknown>
    >(),
    reorder:
      jest.fn<
        (id: number, userId: number, input: unknown) => Promise<unknown>
      >(),
    remove: jest.fn<() => Promise<boolean>>(),
  };
  let resolver: NodeResolver;

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new NodeResolver(nodeService as unknown as NodeService);
  });

  it('passes the authenticated user to the node service', async () => {
    const nodes = [{ id: 13, courseId: 7, title: 'Lesson' }];
    nodeService.findAll.mockResolvedValue(nodes);

    await expect(
      resolver.nodes(7, { userId: 42, email: 'owner@example.com' }),
    ).resolves.toEqual({
      ok: true,
      status: 200,
      message: 'success',
      data: nodes,
    });
    expect(nodeService.findAll).toHaveBeenCalledWith(7, 42);
  });

  it('resolves recursive children from the assembled node tree', () => {
    const child = { id: 2, title: 'Child', children: [] } as never;
    const parent = { id: 1, title: 'Parent', children: [child] } as never;

    expect(resolver.children(parent)).toEqual([child]);
  });

  it('returns an empty list when a node has no children', () => {
    const node = { id: 1, title: 'Root' } as never;

    expect(resolver.children(node)).toEqual([]);
  });

  it('passes the authenticated owner to node movement', async () => {
    const movedNode = { id: 13, parentId: 7 };
    const input = { parentId: 7, position: 2 };
    nodeService.move.mockResolvedValue(movedNode);

    await expect(
      resolver.moveNode(13, input as never, {
        userId: 42,
        email: 'owner@example.com',
      }),
    ).resolves.toMatchObject({ data: movedNode });
    expect(nodeService.move).toHaveBeenCalledWith(13, 42, input);
  });

  it('passes the authenticated owner to node reordering', async () => {
    const reorderedNode = { id: 13, parentId: 7, position: 2 };
    const input = { position: 2 };
    nodeService.reorder.mockResolvedValue(reorderedNode);

    await expect(
      resolver.reorderNode(13, input, {
        userId: 42,
        email: 'owner@example.com',
      }),
    ).resolves.toMatchObject({ data: reorderedNode });
    expect(nodeService.reorder).toHaveBeenCalledWith(13, 42, input);
  });
});
