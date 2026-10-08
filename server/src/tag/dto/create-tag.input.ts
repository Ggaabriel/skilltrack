import { Field, InputType } from '@nestjs/graphql';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateTagInput {
  @Field()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name!: string;
}
