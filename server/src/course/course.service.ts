import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.course.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.course.findUnique({
      where: { id },
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
