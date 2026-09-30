import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

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

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
