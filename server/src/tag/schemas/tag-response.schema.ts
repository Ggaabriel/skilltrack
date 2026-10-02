import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Tag } from './tag.schema';

@ObjectType()
export class TagResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => Tag, { nullable: true })
  data!: Tag | null;
}

@ObjectType()
export class TagsResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => [Tag])
  data!: Tag[];
}

@ObjectType()
export class DeleteTagResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field()
  data!: boolean;
}
