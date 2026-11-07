import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MetadataCleanupService } from '../metadata-cleanup/metadata-cleanup.service';

const courseSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  cover: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      picturePath: true,
    },
  },

  nodes: {
    select: {
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
      skills: {
        select: {
          skill: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  },
} as const;

type CourseWithRelations = Prisma.CourseGetPayload<{
  select: typeof courseSelect;
}>;

function mapCourse(course: CourseWithRelations) {
  const { user, nodes, ...courseData } = course;
  const tags = new Map(
    nodes.flatMap((node) => node.tags.map(({ tag }) => [tag.id, tag] as const)),
  );
  const skills = new Map(
    nodes.flatMap((node) =>
      node.skills.map(({ skill }) => [skill.id, skill] as const),
    ),
  );

  return {
    ...courseData,
    author: user,
    tags: [...tags.values()],
    skills: [...skills.values()],
  };
}

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metadataCleanup: MetadataCleanupService,
  ) {}

  async findAll(userId: number) {
    const courses = await this.prisma.course.findMany({
      where: { userId },
      select: courseSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses.map(mapCourse);
  }

  async findPublishedAll() {
    const courses = await this.prisma.course.findMany({
      where: { isPublished: true },
      select: courseSelect,
      orderBy: { publishedAt: 'desc' },
    });

    return courses.map(mapCourse);
  }

  async findPublishedOne(id: number) {
    const course = await this.prisma.course.findFirst({
      where: { id, isPublished: true },
      select: courseSelect,
    });

    if (!course) {
      throw new NotFoundException('Published course not found');
    }

    return mapCourse(course);
  }

  async findOne(id: number, userId: number) {
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        userId,
      },
      select: courseSelect,
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return mapCourse(course);
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
    return this.prisma.course
      .create({
        select: courseSelect,
        data: {
          userId,
          title: data.title,
          description: data.description,
          type: data.type,
          cover: data.cover,
        },
      })
      .then(mapCourse);
  }

  async update(
    id: number,
    userId: number,
    data: {
      title?: string;
      description?: string | null;
      type?: string;
      cover?: string | null;
    },
  ) {
    await this.assertOwned(id, userId);

    const course = await this.prisma.course.update({
      where: { id },
      data,
      select: courseSelect,
    });

    return mapCourse(course);
  }

  async publish(id: number, userId: number) {
    const course = await this.findOne(id, userId);
    if (course.isPublished) return course;

    const publishedCourse = await this.prisma.course.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
      select: courseSelect,
    });

    return mapCourse(publishedCourse);
  }

  async updateTags(courseId: number, userId: number, tagIds: number[]) {
    await this.assertOwned(courseId, userId);
    const uniqueTagIds = [...new Set(tagIds)];

    return this.prisma.$transaction(async (tx) => {
      const tags = await tx.tag.findMany({
        where: { id: { in: uniqueTagIds } },
        select: { id: true },
      });
      if (tags.length !== uniqueTagIds.length) {
        throw new NotFoundException('One or more tags not found');
      }

      const nodes = await tx.node.findMany({
        where: { courseId },
        select: {
          id: true,
          tags: { select: { tagId: true } },
        },
      });
      const nodeIds = nodes.map(({ id }) => id);
      if (nodeIds.length === 0 && uniqueTagIds.length > 0) {
        throw new BadRequestException(
          'Create a node before assigning course tags',
        );
      }
      if (nodeIds.length > 0) {
        await tx.nodeTag.deleteMany({
          where: { nodeId: { in: nodeIds } },
        });
        if (uniqueTagIds.length > 0) {
          await tx.nodeTag.createMany({
            data: nodeIds.flatMap((nodeId) =>
              uniqueTagIds.map((tagId) => ({ nodeId, tagId })),
            ),
          });
        }

        const previousTagIds = [
          ...new Set(
            nodes.flatMap((node) => node.tags.map(({ tagId }) => tagId)),
          ),
        ];
        await this.metadataCleanup.cleanupUnusedTags(tx, previousTagIds);
      }

      return mapCourse(
        await tx.course.findUniqueOrThrow({
          where: { id: courseId },
          select: courseSelect,
        }),
      );
    });
  }

  async updateSkills(courseId: number, userId: number, skillIds: number[]) {
    await this.assertOwned(courseId, userId);
    const uniqueSkillIds = [...new Set(skillIds)];

    return this.prisma.$transaction(async (tx) => {
      const skills = await tx.skill.findMany({
        where: { id: { in: uniqueSkillIds } },
        select: { id: true },
      });
      if (skills.length !== uniqueSkillIds.length) {
        throw new NotFoundException('One or more skills not found');
      }

      const nodes = await tx.node.findMany({
        where: { courseId },
        select: {
          id: true,
          skills: { select: { skillId: true } },
        },
      });
      const nodeIds = nodes.map(({ id }) => id);
      if (nodeIds.length === 0 && uniqueSkillIds.length > 0) {
        throw new BadRequestException(
          'Create a node before assigning course skills',
        );
      }
      if (nodeIds.length > 0) {
        await tx.nodeSkill.deleteMany({
          where: { nodeId: { in: nodeIds } },
        });
        if (uniqueSkillIds.length > 0) {
          await tx.nodeSkill.createMany({
            data: nodeIds.flatMap((nodeId) =>
              uniqueSkillIds.map((skillId) => ({ nodeId, skillId })),
            ),
          });
        }

        const previousSkillIds = [
          ...new Set(
            nodes.flatMap((node) => node.skills.map(({ skillId }) => skillId)),
          ),
        ];
        await this.metadataCleanup.cleanupUnusedSkills(tx, previousSkillIds);
      }

      return mapCourse(
        await tx.course.findUniqueOrThrow({
          where: { id: courseId },
          select: courseSelect,
        }),
      );
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    await this.prisma.$transaction(async (tx) => {
      const [nodeTags, nodeSkills] = await Promise.all([
        tx.nodeTag.findMany({
          where: { node: { is: { courseId: id } } },
          select: { tagId: true },
        }),
        tx.nodeSkill.findMany({
          where: { node: { is: { courseId: id } } },
          select: { skillId: true },
        }),
      ]);

      await tx.course.delete({ where: { id } });

      const tagIds = nodeTags.map(({ tagId }) => tagId);
      const skillIds = nodeSkills.map(({ skillId }) => skillId);
      await Promise.all([
        ...(tagIds.length > 0
          ? [this.metadataCleanup.cleanupUnusedTags(tx, tagIds)]
          : []),
        ...(skillIds.length > 0
          ? [this.metadataCleanup.cleanupUnusedSkills(tx, skillIds)]
          : []),
      ]);
    });

    return true;
  }

  private assertOwned(id: number, userId: number) {
    return this.findOne(id, userId);
  }
}
