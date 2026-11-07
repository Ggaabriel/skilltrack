import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Skill } from '../../skill/schemas/skill.schema';
import { Tag } from '../../tag/schemas/tag.schema';

@ObjectType()
export class CourseNode {
  @Field(() => ID)
  id!: number;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field(() => Int)
  position!: number;

  @Field(() => ID)
  courseId!: number;

  @Field(() => Int, { nullable: true })
  parentId!: number | null;

  @Field(() => [CourseNode])
  children!: CourseNode[];

  @Field(() => [Tag])
  tags!: Tag[];

  @Field(() => [Skill])
  skills!: Skill[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
