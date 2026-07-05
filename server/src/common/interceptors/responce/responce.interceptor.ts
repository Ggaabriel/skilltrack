import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data: T) => {
        const envelope = {
          ok: true,
          status: response.statusCode,
          message: 'success',
        };

        if (
          data &&
          typeof data === 'object' &&
          !Array.isArray(data) &&
          'data' in data
        ) {
          return {
            ...envelope,
            ...(data as Record<string, unknown>),
          };
        }

        return {
          ...envelope,
          data,
        };
      }),
    );
  }
}
