import { Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';

@Catch(HttpException)
export class GqlHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GqlHttpExceptionFilter.name);

  catch(exception: HttpException) {
    const status = exception.getStatus();
    const response = exception.getResponse();

    this.logger.error('GraphQL exception caught', {
      status,
      response,
      message: exception.message,
      stack: exception.stack,
    });

    throw exception;
  }
}
