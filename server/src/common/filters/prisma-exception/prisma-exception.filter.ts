import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Response } from 'express';
import { Prisma } from 'src/generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    if (host.getType<GqlContextType>() === 'graphql') {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = exception.message;

      if (exception instanceof Prisma.PrismaClientKnownRequestError) {
        switch (exception.code) {
          case 'P2002':
            status = HttpStatus.CONFLICT;
            message = 'Duplicate value found';
            break;

          case 'P2025':
            status = HttpStatus.NOT_FOUND;
            message = 'Record not found';
            break;

          case 'P2003':
            status = HttpStatus.BAD_REQUEST;
            message = 'Related record not found';
            break;
        }
      }

      throw new GraphQLError(message, {
        extensions: {
          status,
          response: null,
          stacktrace: exception.stack ? exception.stack.split('\n') : null,
        },
      });
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          statusCode = HttpStatus.CONFLICT;
          message = 'Duplicate value found';
          break;

        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;

        case 'P2003':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Related record not found';
          break;
      }
    }

    response.status(statusCode).json({
      ok: false,
      status: statusCode,
      message,
    });
  }
}
