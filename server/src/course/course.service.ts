import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const courseSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  cover: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.course.findMany({
      where: { userId },
      select: courseSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.course.findFirst({
      where: { id, userId },
      select: courseSelect,
    });
  }

  create(
    userId: number,
    data: {
      title: string;
      description?: string | null;
      type: string;
      cover?: string | null;
    },
  ) {
    return this.prisma.course.create({
      select: courseSelect,
      data: {
        userId,
        title: data.title,
        description: data.description,
        type: data.type,
        cover: data.cover,
      },
    });
  }

  update(
    id: number,
    userId: number,
    data: {
      title?: string;
      description?: string | null;
      type?: string;
      cover?: string | null;
    },
  ) {
    return this.prisma.course.update({
      where: {
        id,
        userId,
      },
      data,
      select: courseSelect,
    });
  }

  async remove(id: number, userId: number) {
    await this.prisma.course.delete({
      where: {
        id,
        userId,
      },
    });

    return true;
  }
}
