import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
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

@ObjectType()
export class CourseProgressAuthor {
  @Field(() => ID)
  id!: number;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  picturePath!: string | null;
}

@ObjectType()
export class CourseProgressSummary {
  @Field(() => ID)
  id!: number;

  @Field()
  title!: string;

  @Field()
  type!: string;

  @Field(() => CourseProgressAuthor)
  author!: CourseProgressAuthor;

  @Field(() => Int)
  totalNodes!: number;

  @Field(() => Int)
  completedNodes!: number;

  @Field(() => Int)
  percentage!: number;
}

@ObjectType()
export class CourseProgressListResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => [CourseProgressSummary])
  data!: CourseProgressSummary[];
}
