import { Field, Int, ObjectType } from '@nestjs/graphql';
import { NodeProgress } from './node-progress.schema';

@ObjectType()
export class NodeProgressResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => NodeProgress, { nullable: true })
  data!: NodeProgress | null;
}

@ObjectType()
export class NodeProgressListResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => [NodeProgress])
  data!: NodeProgress[];
}

@ObjectType()
export class NodeProgressResetResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field()
  data!: boolean;
}
