import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Media } from './media.schema';

@ObjectType()
export class MediaResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => Media, { nullable: true })
  data!: Media | null;
}

@ObjectType()
export class MediasResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => [Media])
  data!: Media[];
}

@ObjectType()
export class DeleteMediaResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field()
  data!: boolean;
}
