import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNodeInput } from './dto/create-node.input';
import { MoveNodeInput } from './dto/move-node.input';
import { ReorderNodeInput } from './dto/reorder-node.input';
import { UpdateNodeInput } from './dto/update-node.input';

const nodeSelect = {
  id: true,
  title: true,
  content: true,
  position: true,
  courseId: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
} as const;

type NodeRecord = {
  id: number;
  title: string;
  content: string;
  position: number;
  courseId: number;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type NodeTreeItem = NodeRecord & { children: NodeTreeItem[] };

@Injectable()
export class NodeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(courseId: number, userId: number): Promise<NodeTreeItem[]> {
    const records = await this.prisma.node.findMany({
      where: {
        courseId,
        course: { is: { userId } },
      },
      select: nodeSelect,
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });

    return this.buildTree(records);
  }

  async findOne(id: number, userId: number): Promise<NodeTreeItem | null> {
    const node = await this.prisma.node.findFirst({
      where: {
        id,
        course: { is: { userId } },
      },
      select: { courseId: true },
    });

    if (!node) {
      return null;
    }

    return this.findInTree(await this.findAll(node.courseId, userId), id);
  }

  async create(userId: number, input: CreateNodeInput) {
    const course = await this.prisma.course.findFirst({
      where: { id: input.courseId, userId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (input.parentId != null) {
      await this.assertParentInCourse(input.parentId, input.courseId);
    }

    const node = await this.prisma.node.create({
      data: {
        title: input.title,
        content: input.content,
        position: input.position,
        courseId: input.courseId,
        parentId: input.parentId,
      },
      select: { id: true },
    });

    return this.findOne(node.id, userId);
  }

  async update(id: number, userId: number, input: UpdateNodeInput) {
    const node = await this.prisma.node.findFirst({
      where: { id, course: { is: { userId } } },
      select: { id: true, courseId: true },
    });

    if (!node) {
      throw new NotFoundException('Node not found');
    }

    if (input.parentId != null) {
      if (input.parentId === id) {
        throw new BadRequestException('Node cannot be its own parent');
      }
      await this.assertParentInCourse(input.parentId, node.courseId);
      await this.assertNoParentCycle(id, input.parentId, node.courseId);
    }

    const updatedNode = await this.prisma.node.update({
      where: { id, course: { is: { userId } } },
      data: input,
      select: { id: true },
    });

    return this.findOne(updatedNode.id, userId);
  }

  async move(id: number, userId: number, input: MoveNodeInput) {
    const node = await this.prisma.node.findFirst({
      where: { id, course: { is: { userId } } },
      select: { id: true, courseId: true, parentId: true },
    });

    if (!node) {
      throw new NotFoundException('Node not found');
    }

    const newParentId =
      input.parentId === undefined ? node.parentId : input.parentId;
    if (newParentId !== null) {
      if (newParentId === id) {
        throw new BadRequestException('Node cannot be its own parent');
      }

      await this.assertParentInCourse(newParentId, node.courseId);
      await this.assertNoParentCycle(id, newParentId, node.courseId);
    }

    const siblings = await this.prisma.node.findMany({
      where: {
        courseId: node.courseId,
        parentId: newParentId,
        id: { not: id },
      },
      select: { id: true },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });
    const insertionIndex = Math.min(input.position, siblings.length);
    const reorderedTarget = [...siblings];
    reorderedTarget.splice(insertionIndex, 0, { id });

    await this.prisma.$transaction(async (transaction) => {
      if (node.parentId !== newParentId) {
        const oldSiblings = await transaction.node.findMany({
          where: {
            courseId: node.courseId,
            parentId: node.parentId,
            id: { not: id },
          },
          select: { id: true },
          orderBy: [{ position: 'asc' }, { id: 'asc' }],
        });

        await Promise.all(
          oldSiblings.map((sibling, position) =>
            transaction.node.update({
              where: { id: sibling.id },
              data: { position },
            }),
          ),
        );
      }

      await Promise.all(
        reorderedTarget.map((sibling, position) =>
          transaction.node.update({
            where: { id: sibling.id },
            data:
              sibling.id === id
                ? { parentId: newParentId, position }
                : { position },
          }),
        ),
      );
    });

    return this.findOne(id, userId);
  }

  async reorder(id: number, userId: number, input: ReorderNodeInput) {
    return this.move(id, userId, input);
  }

  async remove(id: number, userId: number) {
    await this.prisma.node.delete({
      where: { id, course: { is: { userId } } },
    });

    return true;
  }

  private async assertParentInCourse(parentId: number, courseId: number) {
    const parent = await this.prisma.node.findFirst({
      where: { id: parentId, courseId },
      select: { id: true },
    });

    if (!parent) {
      throw new NotFoundException('Parent node not found in this course');
    }
  }

  private async assertNoParentCycle(
    nodeId: number,
    parentId: number,
    courseId: number,
  ) {
    const nodes = await this.prisma.node.findMany({
      where: { courseId },
      select: { id: true, parentId: true },
    });
    const parentIds = new Map(nodes.map((node) => [node.id, node.parentId]));
    const visited = new Set<number>();
    let currentId: number | null | undefined = parentId;

    while (currentId != null) {
      if (currentId === nodeId || visited.has(currentId)) {
        throw new BadRequestException('Parent assignment would create a cycle');
      }

      visited.add(currentId);
      currentId = parentIds.get(currentId);
    }
  }

  private buildTree(records: NodeRecord[]): NodeTreeItem[] {
    const nodes: NodeTreeItem[] = records.map((record) => ({
      ...record,
      children: [],
    }));
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const roots: NodeTreeItem[] = [];

    for (const node of nodes) {
      const parent =
        node.parentId == null ? undefined : nodesById.get(node.parentId);

      if (!parent || this.wouldCreateCycle(node.id, parent.id, nodesById)) {
        roots.push(node);
      } else {
        parent.children.push(node);
      }
    }

    return roots;
  }

  private wouldCreateCycle(
    nodeId: number,
    parentId: number,
    nodesById: Map<number, NodeTreeItem>,
  ): boolean {
    const visited = new Set<number>();
    let currentId: number | undefined = parentId;

    while (currentId !== undefined) {
      if (currentId === nodeId || visited.has(currentId)) {
        return true;
      }

      visited.add(currentId);
      const current = nodesById.get(currentId);
      currentId = current?.parentId ?? undefined;
    }

    return false;
  }

  private findInTree(
    nodes: NodeTreeItem[],
    targetId: number,
  ): NodeTreeItem | null {
    for (const node of nodes) {
      if (node.id === targetId) {
        return node;
      }

      const match = this.findInTree(node.children, targetId);
      if (match) {
        return match;
      }
    }

    return null;
  }
}
