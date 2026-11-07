import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { MetadataCleanupService } from '../metadata-cleanup/metadata-cleanup.service';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly metadataCleanup: MetadataCleanupService,
  ) {}

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
    await this.prisma.$transaction(async (tx) => {
      const tag = await tx.tag.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!tag) {
        throw new NotFoundException('Tag not found');
      }

      const result = await this.metadataCleanup.cleanupUnusedTags(tx, [id]);
      if (result.count === 0) {
        throw new ConflictException('Tag is still in use');
      }
    });

    return true;
  }
}
