import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { TokenModule } from './token/token.module';
import { AuthCookieModule } from './auth-cookie/auth-cookie.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';
import jwtConfig from './config/jwt.config';
import { ScheduleModule } from '@nestjs/schedule';

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
  ],
})
export class AppModule {}
