import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CourseType } from '../types/course.type';

@InputType()
export class UpdateCourseInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => CourseType, { nullable: true })
  @IsOptional()
  @IsEnum(CourseType)
  type?: CourseType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cover?: string | null;
}
