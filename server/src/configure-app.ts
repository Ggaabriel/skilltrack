import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './common/interceptors/responce/responce.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception/prisma-exception.filter';
import { CustomValidationPipe } from './common/pipes/custom-validation/custom-validation.pipe';

export function configureApp(app: NestExpressApplication): void {
  app.use(cookieParser());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new PrismaExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalPipes(new CustomValidationPipe());
  app.setGlobalPrefix('api');
}
