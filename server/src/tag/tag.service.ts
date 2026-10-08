import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';

const tagSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tag.findMany({
      select: tagSelect,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      select: tagSelect,
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async create(input: CreateTagInput) {
    return this.prisma.tag.create({
      data: {
        name: input.name,
      },
      select: tagSelect,
    });
  }

  async update(id: number, input: UpdateTagInput) {
    await this.findOne(id);

    return this.prisma.tag.update({
      where: { id },
      data: {
        name: input.name,
      },
      select: tagSelect,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.tag.delete({
      where: { id },
    });

    return true;
  }
}
