import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PushSubscriptionKeysDto {
  @IsString()
  'p256dh': string;

  @IsString()
  'auth': string;
}

export class PushSubscriptionDto {
  @ApiProperty({
    example: 'https://example.com/endpoint',
    description: 'The endpoint URL of the push subscription',
  })
  @IsUrl()
  'endpoint': string;

  @ApiProperty({
    example: 3600,
    description: 'The expiration time of the push subscription in seconds',
  })
  @ApiProperty({
    example: {
      p256dh: 'BOr1...',
      auth: 'abc123...',
    },
    description: 'The keys associated with the push subscription',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  'expirationTime': number | null;

  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  'keys': PushSubscriptionKeysDto;
}
