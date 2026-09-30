import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class CreateNodeInput {
  @Field(() => Int)
  @IsDefined()
  @IsInt()
  @Min(1)
  courseId!: number;

  @Field()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field()
  @IsDefined()
  @IsString()
  content!: string;

  @Field(() => Int)
  @IsDefined()
  @IsInt()
  @Min(0)
  position!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number | null;
}
