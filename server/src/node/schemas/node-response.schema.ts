import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CourseNode } from './node.schema';

@ObjectType()
export class NodeResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => CourseNode, { nullable: true })
  data!: CourseNode | null;
}

@ObjectType()
export class NodesResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => [CourseNode])
  data!: CourseNode[];
}

@ObjectType()
export class DeleteNodeResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field()
  data!: boolean;
}
