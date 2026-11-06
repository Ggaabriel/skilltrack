import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
} as const;

type CourseWithRelations = Prisma.CourseGetPayload<{
  select: typeof courseSelect;
}>;

function mapCourse(course: CourseWithRelations) {
  const { user, ...courseData } = course;

  return {
    ...courseData,
    author: user,
    tags: course.tags.map(({ tag }) => tag),
    skills: course.skills.map(({ skill }) => skill),
  };
}

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

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
        where: {
          id: {
            in: uniqueTagIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (tags.length !== uniqueTagIds.length) {
        throw new NotFoundException('One or more tags not found');
      }

      await tx.courseTag.deleteMany({
        where: {
          courseId,
        },
      });

      if (uniqueTagIds.length > 0) {
        await tx.courseTag.createMany({
          data: uniqueTagIds.map((tagId) => ({
            courseId,
            tagId,
          })),
        });
      }

      const course = await tx.course.findUniqueOrThrow({
        where: {
          id: courseId,
        },
        select: courseSelect,
      });

      return mapCourse(course);
    });
  }

  async updateSkills(courseId: number, userId: number, skillIds: number[]) {
    await this.assertOwned(courseId, userId);

    const uniqueSkillIds = [...new Set(skillIds)];

    return this.prisma.$transaction(async (tx) => {
      const skills = await tx.skill.findMany({
        where: {
          id: {
            in: uniqueSkillIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (skills.length !== uniqueSkillIds.length) {
        throw new NotFoundException('One or more skills not found');
      }

      await tx.courseSkill.deleteMany({
        where: {
          courseId,
        },
      });

      if (uniqueSkillIds.length > 0) {
        await tx.courseSkill.createMany({
          data: uniqueSkillIds.map((skillId) => ({
            courseId,
            skillId,
          })),
        });
      }

      const course = await tx.course.findUniqueOrThrow({
        where: {
          id: courseId,
        },
        select: courseSelect,
      });

      return mapCourse(course);
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    await this.prisma.course.delete({
      where: { id },
    });

    return true;
  }

  private assertOwned(id: number, userId: number) {
    return this.findOne(id, userId);
  }
}
