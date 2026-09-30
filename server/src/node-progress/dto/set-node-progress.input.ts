import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';

@InputType()
export class SetNodeProgressInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  nodeId!: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  @Max(100)
  percentage!: number;
}
