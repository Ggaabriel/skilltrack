import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NodeProgress {
  @Field(() => ID)
  id!: number;

  @Field(() => ID)
  nodeId!: number;

  @Field(() => Int)
  percentage!: number;

  @Field(() => Date, { nullable: true })
  completedAt!: Date | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
