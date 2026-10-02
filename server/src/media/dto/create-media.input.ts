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
export class CreateMediaInput {
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

  @Field()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  url!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mimeType?: string;
}
