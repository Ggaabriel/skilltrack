import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaInput } from './dto/create-media.input';
import { UpdateMediaInput } from './dto/update-media.input';

const mediaSelect = {
  id: true,
  name: true,
  url: true,
  mimeType: true,
  courseId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(courseId: number, userId: number) {
    return this.prisma.media.findMany({
      where: {
        courseId,
        course: { is: { userId } },
      },
      select: mediaSelect,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.media.findFirst({
      where: {
        id,
        course: { is: { userId } },
      },
      select: mediaSelect,
    });
  }

  async create(userId: number, input: CreateMediaInput) {
    const course = await this.prisma.course.findFirst({
      where: { id: input.courseId, userId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.media.create({
      data: {
        courseId: input.courseId,
        name: input.name,
        url: input.url,
        mimeType: input.mimeType ?? null,
      },
      select: mediaSelect,
    });
  }

  async update(id: number, userId: number, input: UpdateMediaInput) {
    const media = await this.prisma.media.findFirst({
      where: { id, course: { is: { userId } } },
      select: { id: true },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return this.prisma.media.update({
      where: { id },
      data: input,
      select: mediaSelect,
    });
  }

  async remove(id: number, userId: number) {
    await this.prisma.media.delete({
      where: { id, course: { is: { userId } } },
    });

    return true;
  }
}
