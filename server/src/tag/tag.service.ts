import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';

const tagSelect = {
  id: true,
  name: true,
  courseId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(courseId: number, userId: number) {
    return this.prisma.tag.findMany({
      where: {
        courseId,
        course: { is: { userId } },
      },
      select: tagSelect,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.tag.findFirst({
      where: {
        id,
        course: { is: { userId } },
      },
      select: tagSelect,
    });
  }

  async create(userId: number, input: CreateTagInput) {
    const course = await this.prisma.course.findFirst({
      where: { id: input.courseId, userId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.tag.create({
      data: {
        courseId: input.courseId,
        name: input.name,
      },
      select: tagSelect,
    });
  }

  async update(id: number, userId: number, input: UpdateTagInput) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, course: { is: { userId } } },
      select: { id: true },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return this.prisma.tag.update({
      where: { id },
      data: input,
      select: tagSelect,
    });
  }

  async remove(id: number, userId: number) {
    await this.prisma.tag.delete({
      where: { id, course: { is: { userId } } },
    });

    return true;
  }
}
