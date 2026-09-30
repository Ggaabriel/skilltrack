import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class ReorderNodeInput {
  @Field(() => Int)
  @IsInt()
  @Min(0)
  position!: number;
}
