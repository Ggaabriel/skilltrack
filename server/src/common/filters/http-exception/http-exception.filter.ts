import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Request, Response } from 'express';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();
    const response = exception.getResponse();

    if (host.getType<GqlContextType>() === 'graphql') {
      let message = exception.message;

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const responseMessage = (response as { message?: unknown }).message;

        if (typeof responseMessage === 'string') {
          message = responseMessage;
        } else if (Array.isArray(responseMessage)) {
          message = responseMessage.join(', ');
        }
      }

      throw new GraphQLError(message, { extensions: { status } });
    }

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

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
      status,
      message,
    });
  }
}
