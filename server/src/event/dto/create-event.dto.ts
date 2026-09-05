import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateIf,
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
  @ValidateIf((object, value) => value !== null)
  'description': string | null;

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
    example: '2023-10-15T09:50:00.000Z',
    description: 'The date and time when the notification was sent',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  'notificationSentAt': string | null;
}
