import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Tag {
  @Field(() => ID)
  id!: number;

  @Field()
  name!: string;

  @Field(() => ID)
  courseId!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
