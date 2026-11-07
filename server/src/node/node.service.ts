import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MetadataCleanupService } from '../metadata-cleanup/metadata-cleanup.service';
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
  createdAt: true,
  updatedAt: true,
} as const;

type NodeRecord = Prisma.NodeGetPayload<{ select: typeof nodeSelect }>;
type NodeMetadata = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};
type NodeTreeItem = Omit<NodeRecord, 'tags' | 'skills'> & {
  tags: NodeMetadata[];
  skills: NodeMetadata[];
  children: NodeTreeItem[];
};
type NodeTreeRecord = Omit<NodeTreeItem, 'children'>;

function mapNode(record: NodeRecord): NodeTreeRecord {
  const { tags, skills, ...node } = record;

  return {
    ...node,
    tags: tags.map(({ tag }) => tag),
    skills: skills.map(({ skill }) => skill),
  };
}

@Injectable()
export class NodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metadataCleanup: MetadataCleanupService,
  ) {}

  async findAll(courseId: number, userId: number): Promise<NodeTreeItem[]> {
    const records = await this.prisma.node.findMany({
      where: {
        courseId,
        course: { is: { userId } },
      },
      select: nodeSelect,
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });

    return this.buildTree(records.map(mapNode));
  }

  async findPublished(courseId: number): Promise<NodeTreeItem[]> {
    const records = await this.findPublishedRecords(courseId);
    return this.buildTree(records);
  }

  async findPublishedRecords(courseId: number): Promise<NodeTreeRecord[]> {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, isPublished: true },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Published course not found');
    }

    const records = await this.prisma.node.findMany({
      where: { courseId },
      select: nodeSelect,
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });

    return records.map(mapNode);
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

  async updateTags(nodeId: number, userId: number, tagIds: number[]) {
    const uniqueTagIds = [...new Set(tagIds)];

    await this.prisma.$transaction(async (tx) => {
      const node = await tx.node.findFirst({
        where: { id: nodeId, course: { is: { userId } } },
        select: { id: true },
      });

      if (!node) {
        throw new NotFoundException('Node not found');
      }

      const tags = await tx.tag.findMany({
        where: { id: { in: uniqueTagIds } },
        select: { id: true },
      });
      if (tags.length !== uniqueTagIds.length) {
        throw new NotFoundException('One or more tags not found');
      }

      const previousTags = await tx.nodeTag.findMany({
        where: { nodeId },
        select: { tagId: true },
      });

      await tx.nodeTag.deleteMany({ where: { nodeId } });
      if (uniqueTagIds.length > 0) {
        await tx.nodeTag.createMany({
          data: uniqueTagIds.map((tagId) => ({ nodeId, tagId })),
        });
      }

      const removedTagIds = previousTags
        .map(({ tagId }) => tagId)
        .filter((tagId) => !uniqueTagIds.includes(tagId));
      if (removedTagIds.length > 0) {
        await this.metadataCleanup.cleanupUnusedTags(tx, removedTagIds);
      }
    });

    return this.findOne(nodeId, userId);
  }

  async updateSkills(nodeId: number, userId: number, skillIds: number[]) {
    const uniqueSkillIds = [...new Set(skillIds)];

    await this.prisma.$transaction(async (tx) => {
      const node = await tx.node.findFirst({
        where: { id: nodeId, course: { is: { userId } } },
        select: { id: true },
      });

      if (!node) {
        throw new NotFoundException('Node not found');
      }

      const skills = await tx.skill.findMany({
        where: { id: { in: uniqueSkillIds } },
        select: { id: true },
      });
      if (skills.length !== uniqueSkillIds.length) {
        throw new NotFoundException('One or more skills not found');
      }

      const previousSkills = await tx.nodeSkill.findMany({
        where: { nodeId },
        select: { skillId: true },
      });

      await tx.nodeSkill.deleteMany({ where: { nodeId } });
      if (uniqueSkillIds.length > 0) {
        await tx.nodeSkill.createMany({
          data: uniqueSkillIds.map((skillId) => ({ nodeId, skillId })),
        });
      }

      const removedSkillIds = previousSkills
        .map(({ skillId }) => skillId)
        .filter((skillId) => !uniqueSkillIds.includes(skillId));
      if (removedSkillIds.length > 0) {
        await this.metadataCleanup.cleanupUnusedSkills(tx, removedSkillIds);
      }
    });

    return this.findOne(nodeId, userId);
  }

  async remove(id: number, userId: number) {
    await this.prisma.$transaction(async (tx) => {
      const node = await tx.node.findFirst({
        where: { id, course: { is: { userId } } },
        select: {
          tags: { select: { tagId: true } },
          skills: { select: { skillId: true } },
        },
      });

      if (!node) {
        throw new NotFoundException('Node not found');
      }

      await tx.node.delete({
        where: { id, course: { is: { userId } } },
      });

      const tagIds = node.tags.map(({ tagId }) => tagId);
      const skillIds = node.skills.map(({ skillId }) => skillId);
      await Promise.all([
        ...(tagIds.length > 0
          ? [this.metadataCleanup.cleanupUnusedTags(tx, tagIds)]
          : []),
        ...(skillIds.length > 0
          ? [this.metadataCleanup.cleanupUnusedSkills(tx, skillIds)]
          : []),
      ]);
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

  private buildTree(records: NodeTreeRecord[]): NodeTreeItem[] {
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
