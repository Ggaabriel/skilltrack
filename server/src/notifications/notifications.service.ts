import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PushSubscriptionDto } from './dto/push-subscription.dto';
import { Event } from 'src/generated/prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    webpush.setVapidDetails(
      this.config.getOrThrow<string>('VAPID_SUBJECT'),
      this.config.getOrThrow<string>('VAPID_PUBLIC_KEY'),
      this.config.getOrThrow<string>('VAPID_PRIVATE_KEY'),
    );
  }

  async subscribe(userId: number, dto: PushSubscriptionDto) {
    return this.prisma.pushSubscription.upsert({
      where: {
        endpoint: dto.endpoint,
      },
      update: {
        userId,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        expirationTime: dto.expirationTime
          ? new Date(dto.expirationTime)
          : null,
      },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        expirationTime: dto.expirationTime
          ? new Date(dto.expirationTime)
          : null,
      },
    });
  }

  async unsubscribe(userId: number, endpoint: string) {
    return this.prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });
  }

  async sendTestNotification(userId: number) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: {
        userId,
      },
    });

    const payload = JSON.stringify({
      title: 'SkillTrack',
      body: 'Тестовое уведомление работает!',
      url: '/calendar',
    });

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime?.getTime() ?? null,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        );
      } catch (error) {
        if (
          error instanceof webpush.WebPushError &&
          (error.statusCode === 404 || error.statusCode === 410)
        ) {
          await this.prisma.pushSubscription.delete({
            where: {
              id: subscription.id,
            },
          });

          continue;
        }

        console.error(error);
      }
    }
  }

  // create(createNotificationDto: CreateNotificationDto) {
  //   return 'This action adds a new notification';
  // }

  findAll() {
    return `This action returns all notifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  // update(id: number, updateNotificationDto: UpdateNotificationDto) {
  //   return `This action updates a #${id} notification`;
  // }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }

  async sendEventNotification(userId: number, event: Event) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: {
        userId,
      },
    });

    const payload = JSON.stringify({
      title: 'Скоро событие',
      body: `${event.title} начнётся через 10 минут`,
      url: `/calendar`,
    });

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime?.getTime() ?? null,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        );
      } catch (error) {
        if (
          error instanceof webpush.WebPushError &&
          (error.statusCode === 404 || error.statusCode === 410)
        ) {
          await this.prisma.pushSubscription.delete({
            where: {
              id: subscription.id,
            },
          });
        } else {
          console.error(error);
        }
      }
    }
  }
}
