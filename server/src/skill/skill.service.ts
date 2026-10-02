import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillInput } from './dto/create-skill.input';
import { UpdateSkillInput } from './dto/update-skill.input';

const skillSelect = {
  id: true,
  name: true,
  courseId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(courseId: number, userId: number) {
    return this.prisma.skill.findMany({
      where: {
        courseId,
        course: { is: { userId } },
      },
      select: skillSelect,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.skill.findFirst({
      where: {
        id,
        course: { is: { userId } },
      },
      select: skillSelect,
    });
  }

  async create(userId: number, input: CreateSkillInput) {
    const course = await this.prisma.course.findFirst({
      where: { id: input.courseId, userId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.skill.create({
      data: {
        courseId: input.courseId,
        name: input.name,
      },
      select: skillSelect,
    });
  }

  async update(id: number, userId: number, input: UpdateSkillInput) {
    const skill = await this.prisma.skill.findFirst({
      where: { id, course: { is: { userId } } },
      select: { id: true },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return this.prisma.skill.update({
      where: { id },
      data: input,
      select: skillSelect,
    });
  }

  async remove(id: number, userId: number) {
    await this.prisma.skill.delete({
      where: { id, course: { is: { userId } } },
    });

    return true;
  }
}
