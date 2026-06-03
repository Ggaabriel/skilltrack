import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import type { TEventColor } from '../types/event-color.type';

export class CreateEventDto {
  @ApiProperty({
    example: 'Team Meeting',
    description: 'The title of the event',
  })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  'title': string;

  @ApiProperty({
    example: 'Discuss project timeline and milestones',
    description: 'The description of the event',
  })
  @IsString()
  @IsOptional()
  'description'?: string;

  @ApiProperty({
    example: '2023-10-15T10:00:00.000Z',
    description: 'The start date and time of the event',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  'startDate': string;

  @ApiProperty({
    example: '2023-10-15T11:00:00.000Z',
    description: 'The end date and time of the event',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  'endDate': string;

  @ApiProperty({
    example: 'blue',
    description: 'The color of the event',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  'color': TEventColor;

  @ApiProperty({
    example: 1,
    description: 'The ID of the user who created the event',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  'userId': number;
}
