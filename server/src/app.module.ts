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

      formatError: (formattedError) => {
        const status =
          formattedError.extensions?.code === 'GRAPHQL_PARSE_FAILED' ||
          formattedError.extensions?.code === 'GRAPHQL_VALIDATION_FAILED'
            ? 400
            : typeof formattedError.extensions?.status === 'number'
              ? formattedError.extensions.status
              : 500;

        const stacktrace = formattedError.extensions?.stacktrace;

        return {
          message: formattedError.message,
          ok: false,
          status,
          stack: Array.isArray(stacktrace) ? stacktrace.join('\n') : null,
          response: formattedError.extensions?.response ?? null,
        };
      },
    }),
  ],
})
export class AppModule {}
