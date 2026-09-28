import { Module } from '@nestjs/common';
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
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import type { GraphQLFormattedError } from 'graphql';

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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,

      formatError: normalizeApolloError,
    }),
  ],
})
export class AppModule {}
