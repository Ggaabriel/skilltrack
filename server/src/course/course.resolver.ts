import { ParseIntPipe } from '@nestjs/common';
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

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query(() => CoursesResponse)
  async courses() {
    return graphqlSuccess(await this.courseService.findAll());
  }

  @Query(() => CourseResponse)
  async course(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return graphqlSuccess(await this.courseService.findOne(id));
  }

  @Mutation(() => CourseResponse)
  async createCourse(
    @Args('input', { type: () => CreateCourseInput }) input: CreateCourseInput,
  ) {
    // временно
    const userId = 358;

    return graphqlSuccess(await this.courseService.create(userId, input));
  }

  @Mutation(() => CourseResponse)
  async updateCourse(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => UpdateCourseInput }) input: UpdateCourseInput,
  ) {
    // временно
    const userId = 358;

    return graphqlSuccess(await this.courseService.update(id, userId, input));
  }

  @Mutation(() => DeleteCourseResponse)
  async deleteCourse(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    // временно
    const userId = 358;

    return graphqlSuccess(await this.courseService.remove(id, userId));
  }
}
