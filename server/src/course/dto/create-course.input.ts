import { Field, InputType } from '@nestjs/graphql';
import { CourseType } from '../types/course.type';

@InputType()
export class CreateCourseInput {
  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => CourseType)
  type!: CourseType;

  @Field(() => String, { nullable: true })
  cover?: string | null;
}
