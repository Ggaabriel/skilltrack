import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Media {
  @Field(() => ID)
  id!: number;

  @Field()
  name!: string;

  @Field()
  url!: string;

  @Field({ nullable: true })
  mimeType!: string | null;

  @Field(() => ID)
  courseId!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
