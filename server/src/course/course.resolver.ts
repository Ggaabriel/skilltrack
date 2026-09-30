import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CourseService } from './course.service';

import { UpdateCourseInput } from './dto/update-course.input';
import { Course } from './schemas/course.schema';
import { CreateCourseInput } from './dto/create-course.input';
import {
  CourseResponse,
  CoursesResponse,
  DeleteCourseResponse,
} from './schemas/course-response.schema';
import { graphqlSuccess } from '../common/graphql/graphql-response';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@Resolver(() => Course)
@UseGuards(JwtAuthGuard)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query(() => CoursesResponse)
  async courses(@CurrentUser() { userId }: JwtPayload) {
    return graphqlSuccess(await this.courseService.findAll(userId));
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
    @Args('input', { type: () => CreateCourseInput }) input: CreateCourseInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.courseService.create(userId, input));
  }

  @Mutation(() => CourseResponse)
  async updateCourse(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => UpdateCourseInput }) input: UpdateCourseInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.courseService.update(id, userId, input));
  }

  @Mutation(() => DeleteCourseResponse)
  async deleteCourse(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.courseService.remove(id, userId));
  }
}
