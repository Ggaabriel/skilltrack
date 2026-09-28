import { Field, InputType } from '@nestjs/graphql';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourseType } from '../types/course.type';

@InputType()
export class CreateCourseInput {
  @Field()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => CourseType)
  @IsDefined()
  @IsEnum(CourseType)
  type!: CourseType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cover?: string | null;
}
