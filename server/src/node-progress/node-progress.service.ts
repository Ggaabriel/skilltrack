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
            course: {
              is: {
                OR: [{ userId }, { isPublished: true }],
              },
            },
          },
        },
      },
      select: progressSelect,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findCourseProgressSummaries(userId: number) {
    const courses = await this.prisma.course.findMany({
      where: {
        isPublished: true,
        nodes: {
          some: {
            progress: {
              some: { userId },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        user: {
          select: {
            id: true,
            name: true,
            picturePath: true,
          },
        },
        nodes: {
          select: {
            progress: {
              where: { userId, percentage: 100 },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    return courses.map((course) => {
      const totalNodes = course.nodes.length;
      const completedNodes = course.nodes.filter(
        (node) => node.progress.length > 0,
      ).length;

      return {
        id: course.id,
        title: course.title,
        type: course.type,
        author: course.user,
        totalNodes,
        completedNodes,
        percentage:
          totalNodes === 0
            ? 0
            : Math.round((completedNodes / totalNodes) * 100),
      };
    });
  }

  async resetForCourse(userId: number, courseId: number) {
    const firstNode = await this.prisma.node.findFirst({
      where: {
        courseId,
        course: {
          is: {
            OR: [{ userId }, { isPublished: true }],
          },
        },
      },
      select: { id: true },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });

    await this.prisma.$transaction(async (transaction) => {
      await transaction.nodeProgress.deleteMany({
        where: {
          userId,
          node: { is: { courseId } },
        },
      });

      if (firstNode) {
        await transaction.nodeProgress.create({
          data: {
            userId,
            nodeId: firstNode.id,
            percentage: 0,
            completedAt: null,
          },
        });
      }
    });

    return Boolean(firstNode);
  }

  async removeForCourse(userId: number, courseId: number) {
    const result = await this.prisma.nodeProgress.deleteMany({
      where: {
        userId,
        node: {
          is: {
            courseId,
            course: {
              is: {
                OR: [{ userId }, { isPublished: true }],
              },
            },
          },
        },
      },
    });

    return result.count > 0;
  }

  async setForNode(userId: number, input: SetNodeProgressInput) {
    const node = await this.prisma.node.findFirst({
      where: {
        id: input.nodeId,
        course: {
          is: {
            OR: [{ userId }, { isPublished: true }],
          },
        },
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
          course: {
            is: {
              OR: [{ userId }, { isPublished: true }],
            },
          },
        },
      },
    });

    return result.count > 0;
  }
}
