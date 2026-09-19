import { Field, InputType } from '@nestjs/graphql';
import { CourseType } from '../types/course.type';

@InputType()
export class UpdateCourseInput {
  @Field({ nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => CourseType, { nullable: true })
  type?: CourseType;

  @Field(() => String, { nullable: true })
  cover?: string | null;
}
