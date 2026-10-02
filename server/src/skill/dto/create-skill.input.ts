import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDefined, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

@InputType()
export class CreateSkillInput {
  @Field(() => Int)
  @IsDefined()
  @IsInt()
  @Min(1)
  courseId!: number;

  @Field()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name!: string;
}
