import { ParseIntPipe, UseGuards } from '@nestjs/common';

import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { CourseService } from './course.service';

import { UpdateCourseInput } from './dto/update-course.input';
import { CreateCourseInput } from './dto/create-course.input';

import { Course } from './schemas/course.schema';

import {
  CourseResponse,
  CoursesResponse,
  DeleteCourseResponse,
} from './schemas/course-response.schema';

import { graphqlSuccess } from '../common/graphql/graphql-response';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import type { JwtPayload } from '../auth/types/jwt-payload';
import { NodeService } from '../node/node.service';
import { CourseNode } from '../node/schemas/node.schema';

@Resolver(() => Course)
@UseGuards(JwtAuthGuard)
export class CourseResolver {
  constructor(
    private readonly courseService: CourseService,
    private readonly nodeService: NodeService,
  ) {}

  @Query(() => CoursesResponse)
  async courses(@CurrentUser() { userId }: JwtPayload) {
    return graphqlSuccess(await this.courseService.findAll(userId));
  }

  @Query(() => CoursesResponse)
  async publishedCourses() {
    return graphqlSuccess(await this.courseService.findPublishedAll());
  }

  @Query(() => CourseResponse)
  async publishedCourse(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
  ) {
    return graphqlSuccess(await this.courseService.findPublishedOne(id));
  }

  @ResolveField(() => [CourseNode])
  nodes(@Parent() course: Course) {
    return this.nodeService.findPublishedRecords(course.id);
  }

  @Query(() => CourseResponse)
  async course(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.courseService.findOne(id, userId));
  }

  @Mutation(() => CourseResponse)
  async createCourse(
    @Args('input', { type: () => CreateCourseInput })
    input: CreateCourseInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.courseService.create(userId, input));
  }

  @Mutation(() => CourseResponse)
  async updateCourse(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => UpdateCourseInput })
    input: UpdateCourseInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.courseService.update(id, userId, input));
  }

  @Mutation(() => CourseResponse)
  async publishCourse(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.courseService.publish(id, userId));
  }

  @Mutation(() => CourseResponse)
  async updateCourseTags(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('tagIds', { type: () => [Int] }) tagIds: number[],
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(
      await this.courseService.updateTags(id, userId, tagIds),
    );
  }

  @Mutation(() => CourseResponse)
  async updateCourseSkills(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('skillIds', { type: () => [Int] }) skillIds: number[],
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(
      await this.courseService.updateSkills(id, userId, skillIds),
    );
  }

  @Mutation(() => DeleteCourseResponse)
  async deleteCourse(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.courseService.remove(id, userId));
  }
}
