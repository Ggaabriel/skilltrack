import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class CalendarNotificationScheduler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('* * * * *')
  async handleCalendarNotifications() {
    const now = new Date();

    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    const events = await this.prisma.event.findMany({
      where: {
        startDate: {
          gt: now,
          lte: tenMinutesFromNow,
        },
        notificationSentAt: null,
      },
    });

    for (const event of events) {
      await this.notificationsService.sendEventNotification(
        event.userId,
        event,
      );

      await this.prisma.event.update({
        where: {
          id: event.id,
        },
        data: {
          notificationSentAt: new Date(),
        },
      });
    }
  }
}
