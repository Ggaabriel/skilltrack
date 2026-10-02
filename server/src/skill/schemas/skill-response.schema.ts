import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Skill } from './skill.schema';

@ObjectType()
export class SkillResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => Skill, { nullable: true })
  data!: Skill | null;
}

@ObjectType()
export class SkillsResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field(() => [Skill])
  data!: Skill[];
}

@ObjectType()
export class DeleteSkillResponse {
  @Field()
  ok!: boolean;

  @Field(() => Int)
  status!: number;

  @Field()
  message!: string;

  @Field()
  data!: boolean;
}
