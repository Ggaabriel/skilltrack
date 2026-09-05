import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { JwtStrategy } from 'src/auth/strategies/jwt-strategy';
import { CalendarNotificationScheduler } from './calendar-notification.scheduler';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, JwtStrategy, CalendarNotificationScheduler],
})
export class NotificationsModule {}
