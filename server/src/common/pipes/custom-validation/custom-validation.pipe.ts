import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formatted = errors.flatMap((error) => {
          if (!error.constraints) return [];

          return Object.values(error.constraints).map((message) => ({
            field: error.property,
            message,
          }));
        });
        return new BadRequestException(formatted);
      },
    });
  }
}
