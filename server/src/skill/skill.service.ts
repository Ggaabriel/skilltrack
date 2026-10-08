import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateSkillInput } from './dto/create-skill.input';
import { UpdateSkillInput } from './dto/update-skill.input';

const skillSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.skill.findMany({
      select: skillSelect,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      select: skillSelect,
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  create(input: CreateSkillInput) {
    return this.prisma.skill.create({
      data: {
        name: input.name,
      },
      select: skillSelect,
    });
  }

  async update(id: number, input: UpdateSkillInput) {
    await this.findOne(id);

    return this.prisma.skill.update({
      where: { id },
      data: {
        name: input.name,
      },
      select: skillSelect,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.skill.delete({
      where: { id },
    });

    return true;
  }
}
