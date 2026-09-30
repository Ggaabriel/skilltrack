import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class MoveNodeInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number | null;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  position!: number;
}
