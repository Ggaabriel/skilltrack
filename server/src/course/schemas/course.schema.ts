import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CourseType } from '../types/course.type';
import { Tag } from '../../tag/schemas/tag.schema';
import { Skill } from '../../skill/schemas/skill.schema';

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

  @Field(() => [Tag])
  tags!: Tag[];

  @Field(() => [Skill])
  skills!: Skill[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
