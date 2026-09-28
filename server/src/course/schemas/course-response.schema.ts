import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Course } from './course.schema';

@ObjectType()
export class CourseResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => Course, { nullable: true })
  data!: Course | null;
}

@ObjectType()
export class CoursesResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => [Course])
  data!: Course[];
}

@ObjectType()
export class DeleteCourseResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field()
  data!: boolean;
}
