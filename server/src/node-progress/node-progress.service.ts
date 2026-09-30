import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetNodeProgressInput } from './dto/set-node-progress.input';

const progressSelect = {
  id: true,
  nodeId: true,
  percentage: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class NodeProgressService {
  constructor(private readonly prisma: PrismaService) {}

  findForCourse(courseId: number, userId: number) {
    return this.prisma.nodeProgress.findMany({
      where: {
        userId,
        node: {
          is: {
            courseId,
            course: { is: { userId } },
          },
        },
      },
      select: progressSelect,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async setForNode(userId: number, input: SetNodeProgressInput) {
    const node = await this.prisma.node.findFirst({
      where: {
        id: input.nodeId,
        course: { is: { userId } },
      },
      select: { id: true },
    });

    if (!node) {
      throw new NotFoundException('Node not found');
    }

    const completedAt = input.percentage === 100 ? new Date() : null;

    return this.prisma.nodeProgress.upsert({
      where: {
        userId_nodeId: {
          userId,
          nodeId: input.nodeId,
        },
      },
      create: {
        userId,
        nodeId: input.nodeId,
        percentage: input.percentage,
        completedAt,
      },
      update: {
        percentage: input.percentage,
        completedAt,
      },
      select: progressSelect,
    });
  }

  async resetForNode(userId: number, nodeId: number) {
    const result = await this.prisma.nodeProgress.deleteMany({
      where: {
        userId,
        nodeId,
        node: {
          course: { is: { userId } },
        },
      },
    });

    return result.count > 0;
  }
}
