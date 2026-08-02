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
      map((project: T) => {
        const { data, ...options } = project as {
          data: unknown;
          options?: Record<string, unknown>;
        };
        return {
          ok: true,
          status: response.statusCode,
          message: 'success',
          data,
          options,
        };
      }),
    );
  }
}
// const responseContainer = <T extends Record<string, unknown>>(
//   data: unknown,
//   options?: T,
// ) => ({ data, ...options });
