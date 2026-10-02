import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Skill {
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
