import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class GetUserEventsDto {
  @ApiProperty({
    example: '2026-05-01',
    description: 'The start date to filter events',
  })
  @IsDateString()
  'startDate': string;

  @ApiProperty({
    example: '2026-05-31',
    description: 'The end date to filter events',
  })
  @IsDateString()
  'endDate': string;
}
