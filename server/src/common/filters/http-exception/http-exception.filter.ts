import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const response = exception.getResponse();

    this.logger.error('HTTP exception caught', {
      status,
      response,
      message: exception.message,
      stack: exception.stack,
    });

    let message = response;

    if (typeof response === 'object' && response !== null) {
      message = (response as { message: string }).message || response;
    }
    res.status(status).json({
      ok: false,
      code: status,
      message,
    });
  }
}
