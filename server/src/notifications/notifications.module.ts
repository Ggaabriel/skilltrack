import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { JwtStrategy } from 'src/auth/strategies/jwt-strategy';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, JwtStrategy],
})
export class NotificationsModule {}
