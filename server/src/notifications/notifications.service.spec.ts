import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              if (key === 'VAPID_SUBJECT') return 'mailto:test@example.com';
              if (key === 'VAPID_PUBLIC_KEY')
                return 'BJgajY2ZL__1UJV6rTFA0Lsi-xhHcXi1bWGJFxJzSZZX4XB3uZWSovWP76_ZXPrZ1MjXbiIa0QE-gTm1A5sfpY0';
              if (key === 'VAPID_PRIVATE_KEY')
                return '-xXYaek2LmBTmlBeYKuS8zcWbx9ah4njZN2BLAf2QM0';
              return '1';
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
