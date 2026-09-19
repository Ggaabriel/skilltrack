import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CourseType } from '../types/course.type';

@ObjectType()
export class Course {
  @Field(() => ID)
  id!: number;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => CourseType)
  type!: CourseType;

  @Field(() => String, { nullable: true })
  cover!: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
