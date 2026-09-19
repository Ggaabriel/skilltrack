import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseResolver } from './course.resolver';
import { APP_FILTER } from '@nestjs/core';
import { GqlHttpExceptionFilter } from 'src/common/filters/gql-http-exception/gql-http-exception.filter';
import { GqlPrismaExceptionFilter } from 'src/common/filters/gql-prisma-exception/gql-prisma-exception.filter';

@Module({
  providers: [
    CourseResolver,
    CourseService,
    {
      provide: APP_FILTER,
      useClass: GqlHttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GqlPrismaExceptionFilter,
    },
  ],
})
export class CourseModule {}
