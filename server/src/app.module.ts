import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { TokenModule } from './token/token.module';
import { AuthCookieModule } from './auth-cookie/auth-cookie.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notification/notification.module';
import jwtConfig from './config/jwt.config';
import { ScheduleModule } from '@nestjs/schedule';
import { CourseModule } from './course/course.module';
import { NodeModule } from './node/node.module';
import { NodeProgressModule } from './node-progress/node-progress.module';
import { TagModule } from './tag/tag.module';
import { SkillModule } from './skill/skill.module';
import { MediaModule } from './media/media.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import type { GraphQLFormattedError } from 'graphql';
import type { Request } from 'express';
import { GqlHttpExceptionFilter } from './common/filters/gql-http-exception/gql-http-exception.filter';
import { GqlPrismaExceptionFilter } from './common/filters/gql-prisma-exception/gql-prisma-exception.filter';

export function normalizeApolloError(error: GraphQLFormattedError) {
  const extensions = error.extensions ?? {};
  const statusFromExtensions = extensions.status ?? extensions.statusCode;
  let status =
    typeof statusFromExtensions === 'number' ? statusFromExtensions : 500;

  if (typeof statusFromExtensions !== 'number') {
    switch (extensions.code) {
      case 'GRAPHQL_PARSE_FAILED':
      case 'GRAPHQL_VALIDATION_FAILED':
      case 'BAD_USER_INPUT':
        status = 400;
        break;
      case 'UNAUTHENTICATED':
        status = 401;
        break;
      case 'FORBIDDEN':
        status = 403;
        break;
    }
  }

  return {
    message: error.message,
    ok: false,
    status,
  };
}

@Module({
  imports: [
    UserModule,
    EventModule,
    PrismaModule,
    AuthModule,
    SessionModule,
    TokenModule,
    AuthCookieModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [jwtConfig],
    }),
    NotificationsModule,
    ScheduleModule.forRoot(),
    CourseModule,
    NodeModule,
    NodeProgressModule,
    TagModule,
    SkillModule,
    MediaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      useGlobalPrefix: true,
      context: ({ req }: { req: Request }) => ({ req }),

      formatError: normalizeApolloError,
    }),
  ],
  providers: [
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
export class AppModule {}
