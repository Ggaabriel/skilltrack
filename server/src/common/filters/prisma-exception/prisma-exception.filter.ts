import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from 'src/generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private logAndSendResponse(
    statusCode: HttpStatus,
    message: { cause?: string; target?: string; modelName?: string } | string,
    response: Response,
  ) {
    response.status(statusCode).json({
      ok: false,
      code: statusCode,
      message,
    });
  }

  catch(
    exception: Prisma.PrismaClientKnownRequestError &
      Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const defaultMessage = exception.message.replace(/\n/g, '');
    const { code } = exception;
    let message: string;
    switch (code) {
      case 'P2002':
        message = 'Duplicate value found';
        this.logAndSendResponse(HttpStatus.CONFLICT, message, response);
        break;
      case 'P2025':
        message = 'Record not found';
        this.logAndSendResponse(HttpStatus.NOT_FOUND, message, response);
        break;
      default:
        this.logAndSendResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          defaultMessage,
          response,
        );
        break;
    }
  }
}
