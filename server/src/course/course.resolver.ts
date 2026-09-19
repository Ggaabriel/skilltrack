import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CourseService } from './course.service';

import { UpdateCourseInput } from './dto/update-course.input';
import { Course } from './schemas/course.schema';
import { CreateCourseInput } from './dto/create-course.input';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query(() => [Course])
  courses() {
    return this.courseService.findAll();
  }

  @Query(() => Course, { nullable: true })
  course(@Args('id', { type: () => ID }) id: number) {
    return this.courseService.findOne(id);
  }

  @Mutation(() => Course)
  createCourse(@Args('input') input: CreateCourseInput) {
    // временно
    const userId = 1;

    return this.courseService.create(userId, input);
  }

  @Mutation(() => Course)
  updateCourse(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') input: UpdateCourseInput,
  ) {
    // временно
    const userId = 1;

    return this.courseService.update(id, userId, input);
  }

  @Mutation(() => Boolean)
  deleteCourse(@Args('id', { type: () => ID }) id: number) {
    // временно
    const userId = 1;

    return this.courseService.remove(id, userId);
  }
}
